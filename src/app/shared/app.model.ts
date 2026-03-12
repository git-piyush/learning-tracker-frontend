export interface feedbackModel {
      id?:string;
      rating?:number;
      message?:string;
  };


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
