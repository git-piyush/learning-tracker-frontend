import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import CryptoJS from "crypto-js";
import { environment } from '../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  authStatuschanged = new EventEmitter<void>();
  private static BASE_URL = environment.apiUrl;
  constructor(private http: HttpClient) {}

    private apiEndPoint = "https://api.weatherapi.com/v1/current.json";
    private apiEndPointKey = "d8bcb02f353742858d8110349262202";

    // Encrypt data and save to localStorage
    encryptAndSaveToStorage(key: string, value: string): void {
      localStorage.setItem(key, value);
    }

    getCurrentWeather(cityName:string): Observable<any>  {
       return this.http.get(`${this.apiEndPoint}?key=${this.apiEndPointKey}&q=${cityName}`);
    }

    private cityUrl = "https://api-bdc.io/data/reverse-geocode-client?";
    // `reverse?format=json&lat=${lat}&lon=${lng}`;
    //https://api-bdc.io/data/reverse-geocode-client?latitude=12.9786&longitude=77.364&localityLanguage=en

    private googleApiKey = "AIzaSyD9kH2_e_gSe777LquNhnDvr2t_3l9m2vU";

    getCity(lat:number, lon:number): Observable<any>{
      return this.http.get(`${this.cityUrl}?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
    }





    // Retreive from localStorage and Decrypt
    private getFromStorageAndDecrypt(key: string): any {
      try {
        const encryptedValue = localStorage.getItem(key);
        if (!encryptedValue) return null;
        return encryptedValue;
      } catch (error) {
        return null;
      }
    }

    
  private clearAuth() {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("username");
  }

  private getHeader(): HttpHeaders {
    const token = this.getFromStorageAndDecrypt("token");
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }







  /***AUTH & USERS API METHODS */

  registerUser(body: any): Observable<any> {
    return this.http.post(`${ApiService.BASE_URL}/auth/register`, body);
  }

  loginUser(body: any): Observable<any> {
    return this.http.post(`${ApiService.BASE_URL}/auth/login`, body);
  }

  getLoggedInUserInfo(): Observable<any> {
    return this.http.get(`${ApiService.BASE_URL}/users/current`, {
      headers: this.getHeader(),
    });
  }

/**AUTHENTICATION CHECKER */
    
  logout():void{
    this.clearAuth()
  }

  isAuthenticated():boolean{
    const token = this.getFromStorageAndDecrypt("token");
    return !!token;
  }

  isAdmin():boolean {
    const role = this.getFromStorageAndDecrypt("role");
    return role === "ADMIN";
  }

  //
  saveFeedback(formData: any): Observable<any> {
    return this.http.post(`${ApiService.BASE_URL}/feedback/save`, formData, {
      headers: this.getHeader(),
    });
  }

}
