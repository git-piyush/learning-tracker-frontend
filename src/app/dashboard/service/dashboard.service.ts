import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  authStatuschanged = new EventEmitter<void>();
  private static BASE_URL = environment.apiUrl;
  private static ENCRYPTION_KEY = "phegon-dev-inventory";


  constructor(private http: HttpClient) {}

    // Encrypt data and save to localStorage
    encryptAndSaveToStorage(key: string, value: string): void {
      //const encryptedValue = CryptoJS.AES.encrypt(value, DashboardService.ENCRYPTION_KEY).toString();
      localStorage.setItem(key, value);
    }
  
    // Retreive from localStorage and Decrypt
    private getFromStorageAndDecrypt(key: string): any {
      try {
        const encryptedValue = localStorage.getItem(key);
        if (!encryptedValue) return null;
        //return CryptoJS.AES.decrypt(encryptedValue, DashboardService.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
        return encryptedValue;
      } catch (error) {
        return null;
      }
    }

    
  private clearAuth() {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
  }
  private getHeader(): HttpHeaders {
    const token = this.getFromStorageAndDecrypt("token");
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  loginUser(body: any): Observable<any> {
    return this.http.post(`${DashboardService.BASE_URL}/auth/login`, body);
  }

  getLoggedInUserInfo(): Observable<any> {
    return this.http.get(`${DashboardService.BASE_URL}/users/current`, {
      headers: this.getHeader(),
    });
  }

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

  getDashboardData(): Observable<any> {
    return this.http.get(`${DashboardService.BASE_URL}/dashboard/dashboard-data`, {
      headers: this.getHeader(),
    });
  }

}
