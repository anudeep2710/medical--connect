import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { SockJS } from '../models/mock-sockjs';
import { Client as StompClient } from '../models/mock-stomp';

export interface CallParticipant {
  id: number;
  name: string;
  stream?: MediaStream;
  audio: boolean;
  video: boolean;
}

export interface CallSignal {
  type: 'offer' | 'answer' | 'candidate' | 'leave';
  sender: number;
  receiver: number;
  data: any;
}

@Injectable({
  providedIn: 'root'
})
export class VideoCallService {
  private apiUrl = `${environment.apiUrl}/api/video-calls`;
  private stompClient: any;
  private signalSubject = new Subject<CallSignal>();
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  
  private peerConnections: Map<number, RTCPeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  
  private configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };
  
  public signals$ = this.signalSubject.asObservable();
  public connectionStatus$ = this.connectionStatusSubject.asObservable();
  
  private participantsSubject = new BehaviorSubject<CallParticipant[]>([]);
  public participants$ = this.participantsSubject.asObservable();
  
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Connect to WebSocket for signaling
  connect(userId: number): void {
    const socket = new SockJS(`${environment.apiUrl}/ws`);
    this.stompClient = new StompClient();
    this.stompClient.configure({
      webSocketFactory: () => socket
    });
    
    this.stompClient.onConnect = () => {
      this.connectionStatusSubject.next(true);
      
      // Subscribe to personal signaling channel
      this.stompClient.subscribe(`/user/${userId}/queue/signals`, (signal: any) => {
        const callSignal = JSON.parse(signal.body) as CallSignal;
        this.signalSubject.next(callSignal);
        this.handleSignal(callSignal);
      });
    };
    
    this.stompClient.onWebSocketClose = () => {
      this.connectionStatusSubject.next(false);
      // Try to reconnect after 5 seconds
      setTimeout(() => {
        this.connect(userId);
      }, 5000);
    };
    
    this.stompClient.activate();
  }

  // Disconnect from WebSocket
  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.disconnect();
      this.connectionStatusSubject.next(false);
    }
  }

  // Send a signaling message
  sendSignal(signal: CallSignal): void {
    if (this.stompClient && this.connectionStatusSubject.value) {
      this.stompClient.send('/app/signal', {}, JSON.stringify(signal));
    }
  }

  // Handle incoming signals
  private handleSignal(signal: CallSignal): void {
    const { type, sender, data } = signal;
    
    switch (type) {
      case 'offer':
        this.handleOffer(sender, data);
        break;
      case 'answer':
        this.handleAnswer(sender, data);
        break;
      case 'candidate':
        this.handleCandidate(sender, data);
        break;
      case 'leave':
        this.handleLeave(sender);
        break;
    }
  }

  // Handle incoming offer
  private async handleOffer(senderId: number, offer: RTCSessionDescriptionInit): Promise<void> {
    const pc = this.getOrCreatePeerConnection(senderId);
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    
    this.sendSignal({
      type: 'answer',
      sender: this.authService.getCurrentUser()!.id,
      receiver: senderId,
      data: answer
    });
  }

  // Handle incoming answer
  private async handleAnswer(senderId: number, answer: RTCSessionDescriptionInit): Promise<void> {
    const pc = this.peerConnections.get(senderId);
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }

  // Handle incoming ICE candidate
  private async handleCandidate(senderId: number, candidate: RTCIceCandidateInit): Promise<void> {
    const pc = this.peerConnections.get(senderId);
    if (pc) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }

  // Handle peer leaving
  private handleLeave(senderId: number): void {
    if (this.peerConnections.has(senderId)) {
      this.peerConnections.get(senderId)!.close();
      this.peerConnections.delete(senderId);
      
      const currentParticipants = this.participantsSubject.value;
      this.participantsSubject.next(
        currentParticipants.filter(p => p.id !== senderId)
      );
    }
  }

  // Get or create RTCPeerConnection for a peer
  private getOrCreatePeerConnection(peerId: number): RTCPeerConnection {
    if (this.peerConnections.has(peerId)) {
      return this.peerConnections.get(peerId)!;
    }
    
    const pc = new RTCPeerConnection(this.configuration);
    this.peerConnections.set(peerId, pc);
    
    // Add local tracks to the peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        pc.addTrack(track, this.localStream!);
      });
    }
    
    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignal({
          type: 'candidate',
          sender: this.authService.getCurrentUser()!.id,
          receiver: peerId,
          data: event.candidate
        });
      }
    };
    
    // Handle incoming tracks
    pc.ontrack = (event) => {
      const stream = event.streams[0];
      
      // Update participants list
      const currentParticipants = this.participantsSubject.value;
      const participant = currentParticipants.find(p => p.id === peerId);
      
      if (participant) {
        participant.stream = stream;
        this.participantsSubject.next([...currentParticipants]);
      } else {
        // Get user information and add to participants
        this.http.get<{id: number, fullName: string}>(`${environment.apiUrl}/api/users/${peerId}`)
          .subscribe(user => {
            const newParticipant: CallParticipant = {
              id: user.id,
              name: user.fullName,
              stream: stream,
              audio: true,
              video: true
            };
            
            this.participantsSubject.next([...currentParticipants, newParticipant]);
          });
      }
    };
    
    return pc;
  }

  // Start local media stream
  async startLocalStream(video: boolean = true, audio: boolean = true): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video,
        audio
      });
      
      const currentUser = this.authService.getCurrentUser()!;
      
      // Add local participant to the list
      const localParticipant: CallParticipant = {
        id: currentUser.id,
        name: currentUser.fullName,
        stream: this.localStream,
        audio,
        video
      };
      
      this.participantsSubject.next([localParticipant]);
      
      return this.localStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }

  // Stop local media stream
  stopLocalStream(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
  }

  // Initiate call to a user
  async callUser(userId: number): Promise<void> {
    // Create peer connection
    const pc = this.getOrCreatePeerConnection(userId);
    
    // Create and send offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    
    this.sendSignal({
      type: 'offer',
      sender: this.authService.getCurrentUser()!.id,
      receiver: userId,
      data: offer
    });
  }

  // Leave the call
  leaveCall(): void {
    // Notify all peers
    for (const peerId of this.peerConnections.keys()) {
      this.sendSignal({
        type: 'leave',
        sender: this.authService.getCurrentUser()!.id,
        receiver: peerId,
        data: null
      });
      
      this.peerConnections.get(peerId)!.close();
    }
    
    // Clear peer connections
    this.peerConnections.clear();
    
    // Stop local stream
    this.stopLocalStream();
    
    // Clear participants
    this.participantsSubject.next([]);
  }

  // Toggle audio
  toggleAudio(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
      
      // Update local participant
      const currentParticipants = this.participantsSubject.value;
      const localParticipant = currentParticipants.find(p => p.id === this.authService.getCurrentUser()!.id);
      
      if (localParticipant) {
        localParticipant.audio = enabled;
        this.participantsSubject.next([...currentParticipants]);
      }
    }
  }

  // Toggle video
  toggleVideo(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
      
      // Update local participant
      const currentParticipants = this.participantsSubject.value;
      const localParticipant = currentParticipants.find(p => p.id === this.authService.getCurrentUser()!.id);
      
      if (localParticipant) {
        localParticipant.video = enabled;
        this.participantsSubject.next([...currentParticipants]);
      }
    }
  }
  
  // Replace video track with screen sharing track
  replaceTrack(participantId: number, oldTrack: MediaStreamTrack, newTrack: MediaStreamTrack): void {
    const pc = this.peerConnections.get(participantId);
    if (pc) {
      pc.getSenders().forEach(sender => {
        if (sender.track && sender.track.kind === oldTrack.kind) {
          sender.replaceTrack(newTrack);
        }
      });
    }
  }
  
  // Stop screen sharing
  stopScreenSharing(): void {
    if (this.localStream) {
      // Get a new video stream from the camera
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(newStream => {
          const videoTrack = newStream.getVideoTracks()[0];
          
          // Replace the track in all peer connections
          for (const [peerId, pc] of this.peerConnections.entries()) {
            pc.getSenders().forEach(sender => {
              if (sender.track && sender.track.kind === 'video') {
                sender.replaceTrack(videoTrack);
              }
            });
          }
          
          // Replace the track in the local stream
          if (this.localStream) {
            const oldVideoTracks = this.localStream.getVideoTracks();
            if (oldVideoTracks.length > 0) {
              this.localStream.removeTrack(oldVideoTracks[0]);
            }
            this.localStream.addTrack(videoTrack);
            
            // Update local participant
            const currentParticipants = this.participantsSubject.value;
            const localParticipant = currentParticipants.find(p => p.id === this.authService.getCurrentUser()!.id);
            
            if (localParticipant) {
              localParticipant.stream = this.localStream;
              this.participantsSubject.next([...currentParticipants]);
            }
          }
        })
        .catch(error => {
          console.error('Error getting camera stream:', error);
        });
    }
  }

  // Get appointment details for a video call
  getAppointmentForCall(appointmentId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/appointment/${appointmentId}`);
  }

  // Record call session for a particular appointment
  startRecording(appointmentId: number): Observable<{recordingId: string}> {
    return this.http.post<{recordingId: string}>(`${this.apiUrl}/appointment/${appointmentId}/record/start`, {});
  }

  // Stop recording
  stopRecording(appointmentId: number, recordingId: string): Observable<{recordingUrl: string}> {
    return this.http.post<{recordingUrl: string}>(
      `${this.apiUrl}/appointment/${appointmentId}/record/stop`, 
      { recordingId }
    );
  }
}
