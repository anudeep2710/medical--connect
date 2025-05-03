import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-health-statistics',
  templateUrl: './health-statistics.component.html',
  standalone: true,
  imports: [CommonModule, SharedModule]
})
export class HealthStatisticsComponent implements OnInit, AfterViewInit {
  @ViewChild('heartRateChart') heartRateChartRef!: ElementRef;
  @ViewChild('bloodPressureChart') bloodPressureChartRef!: ElementRef;
  @ViewChild('stepsChart') stepsChartRef!: ElementRef;
  @ViewChild('sleepChart') sleepChartRef!: ElementRef;
  
  isLoading = true;
  error = '';
  
  // Charts
  heartRateChart: any;
  bloodPressureChart: any;
  stepsChart: any;
  sleepChart: any;
  
  // Filters
  timeRange: '7d' | '1m' | '3m' | '6m' | '1y' = '7d';
  
  // Summary stats
  summaryStats = {
    heartRate: { avg: 0, min: 0, max: 0 },
    bloodPressure: { systolicAvg: 0, diastolicAvg: 0 },
    steps: { total: 0, avg: 0, best: 0 },
    sleep: { avg: 0, deep: 0, rem: 0, light: 0 }
  };
  
  // Formatted stats for display
  formattedStats = {
    heartRate: {
      avg: '0', min: '0', max: '0'
    },
    bloodPressure: {
      systolicAvg: '0', diastolicAvg: '0', average: '0/0'
    },
    steps: {
      total: '0', avg: '0', best: '0'
    },
    sleep: {
      avg: '0', deep: '0', rem: '0'
    }
  };
  
  constructor(private userService: UserService) {}
  
  ngOnInit() {
    this.loadHealthStatistics();
  }
  
  ngAfterViewInit() {
    setTimeout(() => {
      this.initCharts();
    }, 100);
  }
  
  loadHealthStatistics() {
    this.isLoading = true;
    
    this.userService.getHealthStatistics().subscribe({
      next: (data) => {
        // Process data and update charts
        this.processHealthData(data);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading health statistics', err);
        this.error = 'Failed to load health statistics. Please try again.';
        this.isLoading = false;
        
        // Initialize with sample data for demonstration
        this.initChartsWithSampleData();
      }
    });
  }
  
  processHealthData(data: any) {
    if (data && data.detailed) {
      // Calculate summary statistics
      if (data.detailed.heartRate) {
        const heartRateValues = data.detailed.heartRate.map((item: any) => item.value);
        this.summaryStats.heartRate = {
          avg: this.average(heartRateValues),
          min: Math.min(...heartRateValues),
          max: Math.max(...heartRateValues)
        };
      }
      
      if (data.detailed.bloodPressure) {
        const systolicValues = data.detailed.bloodPressure.map((item: any) => item.systolic);
        const diastolicValues = data.detailed.bloodPressure.map((item: any) => item.diastolic);
        this.summaryStats.bloodPressure = {
          systolicAvg: this.average(systolicValues),
          diastolicAvg: this.average(diastolicValues)
        };
      }
      
      if (data.detailed.steps) {
        const stepValues = data.detailed.steps.map((item: any) => item.value);
        this.summaryStats.steps = {
          total: stepValues.reduce((a: number, b: number) => a + b, 0),
          avg: this.average(stepValues),
          best: Math.max(...stepValues)
        };
      }
      
      if (data.detailed.sleep) {
        const sleepValues = data.detailed.sleep.map((item: any) => item.total);
        const deepValues = data.detailed.sleep.map((item: any) => item.deep || 0);
        const remValues = data.detailed.sleep.map((item: any) => item.rem || 0);
        const lightValues = data.detailed.sleep.map((item: any) => item.light || 0);
        
        this.summaryStats.sleep = {
          avg: this.average(sleepValues),
          deep: this.average(deepValues),
          rem: this.average(remValues),
          light: this.average(lightValues)
        };
      }
      
      // Update formatted stats for display
      this.updateFormattedStats();
      
      // Update charts with actual data
      this.updateHeartRateChart(data.detailed.heartRate || []);
      this.updateBloodPressureChart(data.detailed.bloodPressure || []);
      this.updateStepsChart(data.detailed.steps || []);
      this.updateSleepChart(data.detailed.sleep || []);
    } else {
      // Initialize with sample data if no data available
      this.initChartsWithSampleData();
    }
  }
  
  average(arr: number[]): number {
    return arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  }
  
  changeTimeRange(range: '7d' | '1m' | '3m' | '6m' | '1y') {
    this.timeRange = range;
    this.loadHealthStatistics();
  }
  
  initCharts() {
    // Using placeholder values instead of actual charts
    console.log('Charts would be initialized here');
    this.initChartsWithSampleData();
  }
  
  initChartsWithSampleData() {
    // Sample data for the statistics
    this.summaryStats = {
      heartRate: { avg: 75, min: 62, max: 86 },
      bloodPressure: { systolicAvg: 118, diastolicAvg: 76 },
      steps: { total: 45230, avg: 6461, best: 8732 },
      sleep: { avg: 7.2, deep: 1.5, rem: 1.8, light: 3.9 }
    };
    
    // Update formatted stats
    this.updateFormattedStats();
  }
  
  updateFormattedStats() {
    // Format all stats for display
    this.formattedStats = {
      heartRate: {
        avg: this.formatNumber(this.summaryStats.heartRate.avg, 0),
        min: this.formatNumber(this.summaryStats.heartRate.min, 0),
        max: this.formatNumber(this.summaryStats.heartRate.max, 0)
      },
      bloodPressure: {
        systolicAvg: this.formatNumber(this.summaryStats.bloodPressure.systolicAvg, 0),
        diastolicAvg: this.formatNumber(this.summaryStats.bloodPressure.diastolicAvg, 0),
        average: this.formatNumber(this.summaryStats.bloodPressure.systolicAvg, 0) + '/' + 
                 this.formatNumber(this.summaryStats.bloodPressure.diastolicAvg, 0)
      },
      steps: {
        total: this.formatTotal(this.summaryStats.steps.total),
        avg: this.formatNumber(this.summaryStats.steps.avg, 0),
        best: this.formatNumber(this.summaryStats.steps.best, 0)
      },
      sleep: {
        avg: this.formatNumber(this.summaryStats.sleep.avg, 1),
        deep: this.formatNumber(this.summaryStats.sleep.deep, 1),
        rem: this.formatNumber(this.summaryStats.sleep.rem, 1)
      }
    };
  }
  
  updateHeartRateChart(data: any[]) {
    console.log('Heart rate chart would be updated with', data.length, 'data points');
  }
  
  updateBloodPressureChart(data: any[]) {
    console.log('Blood pressure chart would be updated with', data.length, 'data points');
  }
  
  updateStepsChart(data: any[]) {
    console.log('Steps chart would be updated with', data.length, 'data points');
  }
  
  updateSleepChart(data: any[]) {
    console.log('Sleep chart would be updated with', data.length, 'data points');
  }
  
  formatNumber(num: number, decimals: number = 1): string {
    if (num === undefined || num === null) {
      return '0';
    }
    return num.toFixed(decimals);
  }
  
  formatTotal(num: number): string {
    if (num === undefined || num === null) {
      return '0';
    }
    return num >= 1000 ? (num / 1000).toFixed(1) + 'k' : num.toString();
  }
}
