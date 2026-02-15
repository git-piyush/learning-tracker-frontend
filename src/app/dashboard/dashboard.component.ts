// Import necessary Angular modules and services
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';  // Module for charts
import { ApiService } from '../service/api.service'; // Service to interact with API
import { FormsModule } from '@angular/forms'; // Forms module for two-way binding

// Define the component metadata
@Component({
  selector: 'app-dashboard', // The component selector
  standalone: true, // Marks this component as standalone (no need for NgModule)
  imports: [CommonModule, NgxChartsModule, FormsModule], // Import other modules required for this component
  templateUrl: './dashboard.component.html', // HTML template
  styleUrl: './dashboard.component.css', // CSS styles for the component
})

export class DashboardComponent implements OnInit{

  activeMonth: string = '';
  dashboardData:any='';
  subCategoryCountMap: Map<string, number> = new Map();
  //  educationalStages = [
  //   { name: '', value: 0, color: '#5f63f2' },
  //   { name: '', value: 0, color: '#34a853' },
  //   { name: '', value: 0, color: '#5ad97e' },
  //   { name: '', value: 0, color: '#20e5c4' },
  //   { name: '', value: 0, color: '#34a853' }
  // ];
  educationalStages: { name: string; value: number; color: string }[] = [];
  getColor(index: number): string {
    const colors = ['#5f63f2', '#17a2b8', '#dc3545', '#ffc107', '#28a745'];
    return colors[index % colors.length];
  }


  constructor(private apiService: ApiService){}

  ngOnInit(): void {
    this.activeMonth = 'All';
    this.loadDashboardDate();
  }

  loadDashboardDate():void{
    this.apiService.getDashboardData().subscribe({
      next: (res: any) => {
          this.dashboardData = res.dashboardResponse;
          this.summaryCards[0].value = this.dashboardData.totalQuestions;
          this.summaryCards[1].value = this.dashboardData.totalQuestionsAddedByYou;
          this.summaryCards[2].value = this.dashboardData.userBookmarked;

          //this.subCategoryCountMap = res.dashboardResponse.countMap;

          this.subCategoryCountMap = new Map(Object.entries(res.dashboardResponse.countMap));


          this.educationalStages = Array.from(this.subCategoryCountMap.entries()).map(
            ([key, value], index) => ({
              name: key,
              value: value,
              color: this.getColor(index) // assign colors dynamically
            })
          );
          console.log(this.educationalStages);
        },
        error: (error) => {
        
      },
    });
  }

  onMonthClick(month: string): void {
    this.activeMonth = month;
  }

  isActive(month: string): boolean {
    return this.activeMonth === month;
  }

  events: { name: string; checked: boolean }[] = [
    { name: 'Elimination Game', checked: true },
    { name: 'Freshman Orientation', checked: false },
    { name: 'Spring Sports Rally', checked: true }
  ];



  selected: boolean[] = [];
  isEditing = false;



  summaryCards = [
    { title: 'Total Questions', value: 0, color: '#f28b82', icon: '❓' },
    { title: 'Questions Added by You', value: 0, color: '#5f63f2', icon: '❓' },
    { title: 'Your Bookmarked', value: 0, color: '#34a853', icon: '⭐' },
    { title: 'New Messages', value: 0, color: '#fbbc04', icon: '💬' },
    { title: 'New Feedback', value: 0, color: '#cf7eb9', icon: '🗪' }
  ];

 

 

  topStudents = [
    { name: 'Rovan Hossam', percent: '99.88%', rank: '1st', color: '#34a853' },
    { name: 'Rony Beyablo', percent: '98.17%', rank: '2nd', color: '#5f63f2' },
    { name: 'Adam Hisham', percent: '97.32%', rank: '3rd', color: '#fbbc04' }
  ];

  months: string[] = [
    'All','January', 'February', 'March', 
    'April','May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
  ];


  toggleEdit() {
    if (this.isEditing) {
      console.log('Events saved:', this.events);
    }
    this.isEditing = !this.isEditing;
  }

  addEvent() {
    this.events.push({ name: 'New Event', checked: false });
  }

  removeEvent(index: number) {
    this.events.splice(index, 1);
  }

}