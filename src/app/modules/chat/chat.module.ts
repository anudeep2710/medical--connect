import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ChatListComponent } from './chat-list/chat-list.component';
import { ChatConversationComponent } from './chat-conversation/chat-conversation.component';

// Import shared module
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
  { path: '', component: ChatListComponent }
];

@NgModule({
  declarations: [],
  imports: [
    SharedModule,
    RouterModule.forChild(routes),
    ChatListComponent,
    ChatConversationComponent
  ]
})
export class ChatModule { }
