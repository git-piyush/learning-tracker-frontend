// Import necessary Angular modules and services
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';  // Module for charts
import { ApiService } from '../service/api.service'; // Service to interact with API
import { FormsModule } from '@angular/forms'; // Forms module for two-way binding
import { DashboardService } from './service/dashboard.service';
import { Router } from '@angular/router';

interface Events1 {id:string;completed:string;task:string};


// Define the component metadata
@Component({
  selector: 'app-dashboard', // The component selector
  standalone: true, // Marks this component as standalone (no need for NgModule)
  imports: [CommonModule, NgxChartsModule, FormsModule], // Import other modules required for this component
  templateUrl: './dashboard.component.html', // HTML template
  styleUrl: './dashboard.component.css', // CSS styles for the component
})

export class DashboardComponent implements OnInit{
  userName:string | null = null;
  activeMonth: string = '';
  dashboardData:any='';
  
  subCategoryCountMap: Map<string, number> = new Map();
  educationalStages: { name: string; value: number; color: string }[] = [];

  summaryCards = [
    { title: 'Total Questions', value: 0, color: '#f28b82', icon: '❓' },
    { title: 'Questions Added by You', value: 0, color: '#5f63f2', icon: '❓' },
    { title: 'Your Bookmarked', value: 0, color: '#34a853', icon: '⭐' },
    { title: 'New Messages', value: 0, color: '#fbbc04', icon: '💬' },
    { title: 'New Feedback', value: 0, color: '#cf7eb9', icon: '🗪' }
  ];

  months: string[] = [
    'All','January', 'February', 'March', 
    'April','May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
  ];

  topStudents = [
    { name: 'Rovan Hossam', percent: '99.88%', rank: '1st', color: '#34a853' },
    { name: 'Rony Beyablo', percent: '98.17%', rank: '2nd', color: '#5f63f2' },
    { name: 'Adam Hisham', percent: '97.32%', rank: '3rd', color: '#fbbc04' }
  ];

  events: {id:string; task: string;completed:string; checked: boolean }[] = [];

  
  events1list: Events1[] = [];



  getColor(index: number): string {
    const colors = ['#5f63f2', '#17a2b8', '#dc3545', '#ffc107', '#28a745'];
    return colors[index % colors.length];
  }

  constructor(private dashboardService: DashboardService, private router: Router){}

  ngOnInit(): void {
    this.userName = localStorage.getItem("username");
    this.activeMonth = 'All';
    this.loadDashboardDate();
  }

  loadDashboardDate():void{
    this.dashboardService.getDashboardData().subscribe({
      next: (res: any) => {
          this.dashboardData = res.dashboardResponse;
          this.summaryCards[0].value = this.dashboardData.totalQuestions;
          this.summaryCards[1].value = this.dashboardData.totalQuestionsAddedByYou;
          this.summaryCards[2].value = this.dashboardData.userBookmarked;
          this.summaryCards[4].value = this.dashboardData.unreadFeedBackCount;
          //this.subCategoryCountMap = res.dashboardResponse.countMap;
          this.subCategoryCountMap = new Map(Object.entries(res.dashboardResponse.countMap));
          this.educationalStages = Array.from(this.subCategoryCountMap.entries()).map(
            ([key, value], index) => ({
              name: key,
              value: value,
              color: this.getColor(index) // assign colors dynamically
            })
          );
          this.events1list = res.dashboardResponse.toDoList;
          this.events = this.events1list.map((item: Events1) => ({
            id:item.id,
            completed:item.completed,
            task: item.task,
            checked: item.completed === 'Y'
          }));
          console.log(this.events);
        },
        error: (error) => {
        
      },
    });
  }

  onCardClick(card: any) {
    if (card.title === 'New Feedback') {
        this.router.navigate(['/feedback-list']);
    }
  }

  onMonthClick(month: string): void {
    this.activeMonth = month;
  }

  isActive(month: string): boolean {
    return this.activeMonth === month;
  }





  selected: boolean[] = [];
  isEditing = false;

  toggleEdit() {
        if (this.isEditing) {
          this.events = this.events.map(e => ({
        ...e,
          completed: e.checked ? 'Y' : 'N'
         }));
      console.log('Events saved:', this.events);
      this.dashboardService.createTodos(this.events).subscribe({
          next: (res:any) => {
                alert('Todos Added Sucessfully!');
              },
              error: (err: any) => {
              if(err.error.status===401){
                alert('Need Access/Login!');
                this.router.navigate(['/login']);
              }
              alert(err.error.message);
            }
        });
    }
    this.isEditing = !this.isEditing;
  }

  addEvent() {
    this.events.push({id:'', task: 'New Event',completed:'N', checked: false });
  }

  removeEvent(index: number) {
    this.events.splice(index, 1);
  }

}