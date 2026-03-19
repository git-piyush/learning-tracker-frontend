import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { InterviewQuestion } from '../question-details/question-details.component';

@Injectable({
  providedIn: 'root'
})

export class QuestionService {

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







  /***AUTH & USERS API METHODS */

  registerUser(body: any): Observable<any> {
    return this.http.post(`${QuestionService.BASE_URL}/auth/register`, body);
  }

  loginUser(body: any): Observable<any> {
    return this.http.post(`${QuestionService.BASE_URL}/auth/login`, body);
  }

  getLoggedInUserInfo(): Observable<any> {
    return this.http.get(`${QuestionService.BASE_URL}/users/current`, {
      headers: this.getHeader(),
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
        params = params.set('subcategory', searchForm.subCategory);
      }
      if (searchForm.type) {
        params = params.set('type', searchForm.type);
      }
      if (searchForm.bookmark) {
        params = params.set('bookmark', searchForm.bookmark);
      }

      return this.http.get(`${QuestionService.BASE_URL}/question/all`, {
        headers: this.getHeader(),
        params: params
      });
  }

  getQuestionById(id: string): Observable<any> {
    return this.http.get(`${QuestionService.BASE_URL}/question/get-question/${id}`, {
      headers: this.getHeader(),
    });
  }

  getNextQuestionById(id: string): Observable<any> {
    return this.http.get(`${QuestionService.BASE_URL}/question/get-next-question/${id}`, {
      headers: this.getHeader(),
    });
  }

  getPrevQuestionById(id: string): Observable<any> {
    return this.http.get(`${QuestionService.BASE_URL}/question/get-prev-question/${id}`, {
      headers: this.getHeader(),
    });
  }

  updateCategory(id: string, body: any): Observable<any> {
    return this.http.put(
      `${QuestionService.BASE_URL}/categories/update/${id}`,
      body,
      {
        headers: this.getHeader(),
      }
    );
  }

  deleteCategory(id: string): Observable<any> {
    return this.http.delete(`${QuestionService.BASE_URL}/categories/delete/${id}`, {
      headers: this.getHeader(),
    });
  }


  addQuestion(formData: any): Observable<any> {
    return this.http.post(`${QuestionService.BASE_URL}/question/add-question`, formData, {
      headers: this.getHeader(),
    });
  }

  deleteQuestionById(id: string): Observable<any> {
    return this.http.delete(`${QuestionService.BASE_URL}/question/delete/${id}`, {
      headers: this.getHeader(),
    });
  }

  updateProduct(formData: any): Observable<any> {
    console.log('formData:'+formData);
    return this.http.put(`${QuestionService.BASE_URL}/question/update-question`, formData, {
      headers: this.getHeader(),
    });
  }

  getInterviewQuestions(parentQuestionId: string): Observable<any> {
    return this.http.get(`${QuestionService.BASE_URL}/interviewquestion/`+parentQuestionId, {
        headers: this.getHeader(),
    });
  }

  addInterviewQuestion(iq: Partial<InterviewQuestion>): Observable<any> {
     return this.http.post(`${QuestionService.BASE_URL}/interviewquestion`, iq, {
        headers: this.getHeader(),
    });
  }

  updateInterviewQuestion(iq: InterviewQuestion): Observable<any> {
   return this.http.put(`${QuestionService.BASE_URL}/update-interviewquestion`, iq, {
        headers: this.getHeader(),
    });
  }

  deleteInterviewQuestion(id: string): Observable<void> {
    return this.http.delete<void>(`${QuestionService.BASE_URL}/delete-interviewquestion/${id}`, {
        headers: this.getHeader(),
    });
  }

}