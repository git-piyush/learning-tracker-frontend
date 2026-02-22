// Import necessary Angular modules and services
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';  // Module for charts
import { ApiService } from '../service/api.service'; // Service to interact with API
import { FormsModule } from '@angular/forms'; // Forms module for two-way binding
import { DashboardService } from './service/dashboard.service';
import { Router } from '@angular/router';
import Chart from 'chart.js/auto';

interface Todo1 {id:string;completed:string;task:string};


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

  dailyQuestionCountMap: Map<string, number> = new Map();

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

  todos: {id:string; task: string;completed:string; checked: boolean }[] = [];

  
  todo1list: Todo1[] = [];
  toDoMap!: { [date: string]: any[] };



  getColor(index: number): string {
    const colors = ['#5f63f2', '#17a2b8', '#dc3545', '#ffc107', '#28a745'];
    return colors[index % colors.length];
  }

  constructor(private dashboardService: DashboardService, private router: Router){}

  ngOnInit(): void {
    this.userName = localStorage.getItem("username");
    this.activeMonth = 'All';
    this.loadDashboardDate();
   // this.loadDailyChart();
  }
  ngAfterViewInit(): void {
    
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

          this.todo1list = res.dashboardResponse.toDoList;
          this.todos = this.todo1list.map((item: Todo1) => ({
            id:item.id,
            completed:item.completed,
            task: item.task,
            checked: item.completed === 'Y'
          }));

          this.toDoMap = res.dashboardResponse.toDoMap;
          
          this.dailyQuestionCountMap = new Map(Object.entries(res.dashboardResponse.dailyQuestionCountMap));
          this.loadDailyChart(this.dailyQuestionCountMap);

        },
        error: (error) => {
        
      },
    });
  }
  dateDescOrder = (a: any, b: any): number => {
    return new Date(b.key).getTime() - new Date(a.key).getTime();
  };

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
          this.todos = this.todos.map(e => ({
        ...e,
          completed: e.checked ? 'Y' : 'N'
         }));
      console.log('Events saved:', this.todos);
      this.dashboardService.createTodos(this.todos).subscribe({
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
    this.todos.push({id:'', task: 'New Event',completed:'N', checked: false });
  }

  removeEvent(index: number) {
    this.todos.splice(index, 1);
  }

 loadDailyChart(dailyQuestionCountMap: Map<string, number>) {
    const today = new Date();
    const currentDay = today.getDate(); // e.g. 15
    const monthName = today.toLocaleString('default', { month: 'long' });

    const labels = Array.from(dailyQuestionCountMap.keys());
    const data = Array.from(dailyQuestionCountMap.values());

    const colors = Array.from({ length: currentDay }, () =>
      `hsl(${Math.floor(Math.random() * 360)}, 70%, 55%)`
    );

    new Chart('dailyChart', {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: `Questions Added in ${monthName}`,
          data,
          backgroundColor: colors,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  }

}