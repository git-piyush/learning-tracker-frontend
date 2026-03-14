import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})

export class TransactionService {

  authStatuschanged = new EventEmitter<void>();
  private static BASE_URL = environment.apiUrl;
  private static ENCRYPTION_KEY = "phegon-dev-inventory";


  constructor(private http: HttpClient) {}

    // Retreive from localStorage and Decrypt
    private getFromStorage(key: string): any {
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
  }



  private getHeader(): HttpHeaders {
    const token = this.getFromStorage("token");
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }


  getAllQuestions(page:number, size:number, order:string, orderBy:string, searchForm:any): Observable<any> {
    let params = new HttpParams()
    .set('page', page)
    .set('size', size)
    .set('direction', order)
    .set('sortBy', orderBy);

      // Add search filters if provided
      if (searchForm.category) {
        params = params.set('category', searchForm.category);
      }
      if (searchForm.subCategory) {
        params = params.set('subCategory', searchForm.subCategory);
      }
      if (searchForm.type) {
        params = params.set('type', searchForm.type);
      }
      if (searchForm.bookmark) {
        params = params.set('bookmark', searchForm.bookmark);
      }

      return this.http.get(`${TransactionService.BASE_URL}/question/all-questions`, {
        headers: this.getHeader(),
        params: params
      });
  }

}
