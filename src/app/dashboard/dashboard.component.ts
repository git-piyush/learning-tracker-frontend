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

interface MatchCard {
  id: string;
  teams: string;
  date: string;
  time: string;
  matchType: string;
  status: string;
  team1Img?: string;
  team2Img?: string;
}

interface MatchSlide {
  id: string;
  teams: string;
  date: string;
  time: string;
  matchType: string;
}



// Define the component metadata
@Component({
  selector: 'app-dashboard', // The component selector
  standalone: true, // Marks this component as standalone (no need for NgModule)
  imports: [CommonModule, NgxChartsModule, FormsModule], // Import other modules required for this component
  templateUrl: './dashboard.component.html', // HTML template
  styleUrl: './dashboard.component.css', // CSS styles for the component
})

export class DashboardComponent implements OnInit{

    
  nextFiveMatches: MatchCard[] = [];
  currentIndex = 0;
  slideInterval: any;

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



  userName:string | null = null;
  activeMonth: string = '';
  dashboardData:any='';
  
  subCategoryCountMap: Map<string, number> = new Map();

  dailyQuestionCountMap: Map<string, number> = new Map();

  educationalStages: { name: string; value: number; color: string }[] = [];

  constructor(private dashboardService: DashboardService, private router: Router, private apiService:ApiService){}

    ngOnInit(): void {
      this.userName = localStorage.getItem("username");
      this.activeMonth = 'All';
      this.loadDashboardDate();
      //this.getLocation();
      this.loadTemperature();

      this.loadCricketData();

      this.startAutoSlide();
  }

  startAutoSlide(): void {
    this.slideInterval = setInterval(() => {
      this.currentIndex =
        (this.currentIndex + 1) % this.nextFiveMatches.length;
    }, 4000); // ⏱ 4 seconds
  }

  saveSubscription(match: MatchSlide): void {
    console.log('Subscribed Match:', match);
    // 👉 call API here
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
  loadCricketData(){
    this.apiService.getcricketData()
          .subscribe(res => {
              console.log(res.data);
              const now = new Date();

              this.nextFiveMatches = res.data

                // future + today matches
                .filter((m: any) => new Date(m.dateTimeGMT) >= now)

                // sort by time
                .sort(
                  (a: any, b: any) =>
                    new Date(a.dateTimeGMT).getTime() -
                    new Date(b.dateTimeGMT).getTime()
                )

                // take only next 5
                .slice(0, 5)

                // map to clean object
                .map((m: any): MatchCard => ({
                  id: m.id,
                  teams: `${m.t1} vs ${m.t2}`,
                  date: this.getDate(m.dateTimeGMT),
                  time: this.getTime(m.dateTimeGMT),
                  matchType: m.matchType.toUpperCase(),
                  status: m.ms,
                  team1Img: m.t1img,
                  team2Img: m.t2img
                }));
                console.log(this.nextFiveMatches);
          });

        this.apiService.increaseKeyHits()
          .subscribe(res => {
              console.log('Key hit got incremented.');
      });
  }

  getColor(index: number): string {
    const colors = ['#5f63f2', '#17a2b8', '#dc3545', '#ffc107', '#28a745'];
    return colors[index % colors.length];
  }


  ngAfterViewInit(): void {
    
  }  loadDashboardDate():void{
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
  reloadDashboard(): void {
    const currentUrl = this.router.url;

    this.router.navigateByUrl('/dashboard', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
    });
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