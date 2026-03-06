// Import necessary Angular modules and services
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';  // Module for charts
import { ApiService } from '../service/api.service'; // Service to interact with API
import { FormsModule } from '@angular/forms'; // Forms module for two-way binding
import { DashboardService } from './service/dashboard.service';
import { Router } from '@angular/router';
import Chart from 'chart.js/auto';
import { NotificationService } from '../shared/notificationService';
import { Subscription, timer } from 'rxjs';

interface Todo1 {id:string;completed:string;task:string};

interface WeatherCard {
  city: string;
  currentTemp: number;
  zone: string;
  weatherType: string;
  hTemp: number;
  lTemp: number;
  humidity: number;
  lastUpdated: string;
}

interface Match{
    id:string;
    dateTimeGMT:string;
    dateTimeIST:string;
    matchType:string;
    status:string;
    ms:string;
    t1:string;
    t2:string;
    t1s:string;
    t2s:string;
    t1img:string;
    t2img:string;
    series:string;
    date: string;
    time: string;
    strdate: string;
    strtime: string;
    teams: string;
    flgMatchStarted: string;
    flgMatchEnded: string;
}

interface LiveScore{
    status:string;
    name:string;

    matchid:string;

    t1:string;

    t1s:string;

    t1o:string;

    t1w:string;

    t2:string;

    t2s:string;

    t2o:string;

    t2w:string;
}

// Define the component metadata
@Component({
  selector: 'app-dashboard', // The component selector
  standalone: true, // Marks this component as standalone (no need for NgModule)
  imports: [CommonModule, NgxChartsModule, FormsModule], // Import other modules required for this component
  templateUrl: './dashboard.component.html', // HTML template
  styleUrl: './dashboard.component.css', // CSS styles for the component
})

export class DashboardComponent implements OnInit, OnDestroy {

  subscribedMatches: Match[] = [];
  liveScoreCards: LiveScore[] = [];

  nextFiveMatches: Match[] = [];

  slides: any[] = [];
  currentIndex2 = 0;
  slideInterval2: any;

  currentIndex = 0;
  currentIndex1 = 0;
  slideInterval: any;
  slideInterval1: any;

  weatherCard: WeatherCard = {
      city: '',
      currentTemp: 0,
      zone: '',
      weatherType: '',
      hTemp: 0,
      lTemp: 0,
      humidity: 0,
      lastUpdated: ''
    };

 temperature!: number;
 city!: string;
 livescore:boolean=false;



  userName:string | null = null;
  activeMonth: string = '';
  dashboardData:any='';
  
  subCategoryCountMap: Map<string, number> = new Map();

  dailyQuestionCountMap: Map<string, number> = new Map();

  educationalStages: { name: string; value: number; color: string }[] = [];

  constructor(private dashboardService: DashboardService, 
    private router: Router, 
    private apiService:ApiService, private notify: NotificationService){}

    tenMinSub!: Subscription;
    isTenMinEnabled = true;

    ngOnInit(): void {
      this.userName = localStorage.getItem("username");
      this.loadDashboardDate();
      this.loadTemperature();

      this.loadCricketData();

      this.loadSubscribedMatches();

      this.startTenMinTask();
  }

      startTenMinTask(): void {
        console.log('inside startTenMinTask');
        if (this.tenMinSub) {
          return; // already running
        }

        this.tenMinSub = timer(0, 10 * 60 * 1000).subscribe(() => {
          if (this.isTenMinEnabled) {
            this.executeEveryTenMinutes();
          }
        });
      }

      stopTenMinTask(): void {
        this.tenMinSub?.unsubscribe();
        this.tenMinSub = undefined as any;
      }

      executeEveryTenMinutes(): void {
        console.log('Executed every 10 minutes', new Date());
        this.loadSubscribedMatches();
      }

      ngOnDestroy(): void {
        this.stopTenMinTask();
      }

      startAutoSlide(): void {
        this.slideInterval = setInterval(() => {
          this.currentIndex =
            (this.currentIndex + 1) % this.nextFiveMatches.length;
        }, 3000); // ⏱ 3 seconds
      }

      pauseAutoSlide(): void {
        if (this.slideInterval) {
          clearInterval(this.slideInterval);
          this.slideInterval = null;
        }
      }

      resumeAutoSlide(): void {
        if (!this.slideInterval) {
          this.startAutoSlide();
        }
      }

      startAutoSlide2(): void {
        if (this.slideInterval2) {
          clearInterval(this.slideInterval2); // stop previous timer
        }

        this.slideInterval2 = setInterval(() => {
          this.currentIndex2 =
            (this.currentIndex2 + 1) % this.slides.length;
        }, 3000);
      }

      pauseAutoSlide2(): void {
        if (this.slideInterval2) {
          clearInterval(this.slideInterval2);
          this.slideInterval2 = null;
        }
      }

      resumeAutoSlide2(): void {
        if (!this.slideInterval2) {
          this.startAutoSlide2();
        }
      }



      saveSubscription(match: Match): void {
        console.log('Subscribed Match:', match);
          this.dashboardService.saveSubscription(match).subscribe({
            next: res => {
              this.notify.info(res.message);
            },
            error: err => {
              this.notify.error(err.error.message);
            }
          });
          setTimeout(() => this.reloadDashboard(), 3000);
      }

  
      unsubscribeSubscription(match: Match): void {
        console.log('Subscribed Match:', match);
          this.dashboardService.unsubscribeSubscription(match).subscribe({
            next: res => {
              this.notify.info(res.message);
            },
            error: err => {
              this.notify.error(err.error.message);
            }
          });
          setTimeout(() => this.reloadDashboard(), 3000);
      }

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

    { name: 'Rony Beyablo', percent: '98.17%', rank: '2nd', color: '#34a853' },
    { name: 'Adam Hisham', percent: '97.32%', rank: '3rd', color: '#fbbc04' }
  ];

  todos: {id:string; task: string;completed:string; checked: boolean }[] = [];

  
  todo1list: Todo1[] = [];
  toDoMap!: { [date: string]: any[] };
  selectedCity:string = '';
  loadTemperature() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      this.apiService.getCity(lat, lng).subscribe(res => {
        this.selectedCity = res.city;
        this.apiService.getCurrentWeather(this.selectedCity)
          .subscribe(weather => {
              const location = weather.location;
              const current = weather.current;

              console.log('Location:', location);
              console.log('Current:', current);
              const lastUpdated = weather.current.last_updated;
              const timeOnly = lastUpdated.split(' ')[1];
              this.weatherCard = {
                    city: weather.location.name+','+weather.location.region,
                    currentTemp: weather.current.temp_c,
                    zone: weather.location.tz_id,
                    weatherType: weather.current.condition.text, // usually inside current.condition
                    hTemp: weather.current.temp_c,   // or use max temp if API provides
                    lTemp: weather.current.temp_c, // or use min temp if API provides
                    humidity: weather.current.humidity,
                    lastUpdated: timeOnly
                  };
                  console.log('weatherCard: '+this.weatherCard);
          });
      });
    });
  }
}

loadCricketData() {
  this.dashboardService.getNextFiveMatches().subscribe({
    next: (res: any) => {

      this.nextFiveMatches = res.matches;
      if (this.nextFiveMatches.length > 0) {
        this.currentIndex = 0;
        this.startAutoSlide();
      }
    },
    error: err => {
      console.error('API error:', err);
      this.nextFiveMatches = [];
    }
  });
}


loadSubscribedMatches(){
  
  this.dashboardService.getSubscribedMatch().subscribe(res => {
    this.slides = [];
              console.log(JSON.stringify(res, null, 2));

              //console.log('subscribedMatches2:', JSON.stringify(res.matches, null, 2));
              this.subscribedMatches = res.matches;
             console.log('subscribedMatches length: '+this.subscribedMatches.length);
                this.subscribedMatches.forEach(m => {
                  this.slides.push({
                    type: 'subscribed',
                    data: m
                  });
                });

                this.liveScoreCards = res.liveScoreDetails;

                console.log('liveScoreCards length: '+this.liveScoreCards.length);
                this.liveScoreCards.forEach(m => {
                  this.slides.push({
                    type: 'live',
                    data: m
                  });
                });
                console.log('Slides length:', this.slides.length);
                this.startAutoSlide2();
                
          });
  }

  getColor(index: number): string {
    const colors = ['#5f63f2', '#17a2b8', '#dc3545', '#ffc107', '#28a745'];
    return colors[index % colors.length];
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

  selected: boolean[] = [];
  isEditing = false;
  reloadDashboard(): void {
    const currentUrl = this.router.url;
    window.location.reload();

  }

  toggleEdit() {
        if (this.isEditing) {
          this.todos = this.todos.map(e => ({
        ...e,
          completed: e.checked ? 'Y' : 'N'
         }));
      console.log('Events saved:', this.todos);
      this.dashboardService.createTodos(this.todos).subscribe({
          next: (res:any) => {
               // alert('Todos Added Sucessfully!');
                this.reloadDashboard();
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

  getDate(dateTime: string): string {
    const d = new Date(dateTime);
    return d.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short'
    });
  }

  getTime(dateTime: string): string {
    const d = new Date(dateTime);
    return d.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

}