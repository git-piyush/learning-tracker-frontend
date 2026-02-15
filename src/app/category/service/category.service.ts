import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  authStatuschanged = new EventEmitter<void>();
  private static BASE_URL = environment.apiUrl;


  constructor(private http: HttpClient) {}

    // Encrypt data and save to localStorage
    encryptAndSaveToStorage(key: string, value: string): void {
      //const encryptedValue = CryptoJS.AES.encrypt(value, CategoryService.ENCRYPTION_KEY).toString();
      localStorage.setItem(key, value);
    }
  
    // Retreive from localStorage and Decrypt
    private getFromStorageAndDecrypt(key: string): any {
      try {
        const encryptedValue = localStorage.getItem(key);
        if (!encryptedValue) return null;
        //return CryptoJS.AES.decrypt(encryptedValue, CategoryService.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
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

  /***AUTH & USERS API METHODS */
  registerUser(body: any): Observable<any> {
    return this.http.post(`${CategoryService.BASE_URL}/auth/register`, body);
  }

  loginUser(body: any): Observable<any> {
    return this.http.post(`${CategoryService.BASE_URL}/auth/login`, body);
  }

  getLoggedInUserInfo(): Observable<any> {
    return this.http.get(`${CategoryService.BASE_URL}/users/current`, {
      headers: this.getHeader(),
    });
  }

  /**CATEGOTY ENDPOINTS */
  createCategory(body: any): Observable<any> {
    return this.http.post(`${CategoryService.BASE_URL}/categories/add`, body, {
      headers: this.getHeader(),
    });
  }

  updateCategory(body: any): Observable<any> {
    return this.http.post(`${CategoryService.BASE_URL}/categories/update`, body, {
      headers: this.getHeader(),
    });
  }

  getAllCategory(page:number, size:number, order:string, orderBy:string, searchForm:any): Observable<any> {
    let params = new HttpParams()
    .set('page', page)
    .set('size', size)
    .set('direction', order)
    .set('sortBy', orderBy);

  // Add search filters if provided
  if (searchForm.category) {
    params = params.set('category', searchForm.category);
  }
  if (searchForm.refCode) {
    params = params.set('refCode', searchForm.refCode);
  }
  if (searchForm.refCodeLongName) {
    params = params.set('longName', searchForm.refCodeLongName);
  }
  if (searchForm.active) {
    params = params.set('active', searchForm.active);
  }

    return this.http.get(`${CategoryService.BASE_URL}/categories/all`, {
      headers: this.getHeader(),
      params: params
    });
  }

  getCategoryList(): Observable<any> {
    return this.http.get(`${CategoryService.BASE_URL}/categories/category-list`, {
      headers: this.getHeader(),
    });
  }

  getSubCategoryMap(cat: string): Observable<any> {
    return this.http.get(`${CategoryService.BASE_URL}/categories/getsubcategory-map/${cat}`, {
      headers: this.getHeader(),
    });
  }

  getCategoryByCategory(cat:string): Observable<any> {
    return this.http.get(`${CategoryService.BASE_URL}/categories/categoryByCategory/`+cat, {
      headers: this.getHeader(),
    });
  }

  getCategoryById(id: string): Observable<any> {
    return this.http.get(`${CategoryService.BASE_URL}/categories/get-category/${id}`, {
      headers: this.getHeader(),
    });
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${CategoryService.BASE_URL}/categories/delete-category/${id}`, {
      headers: this.getHeader(),
    });
  }


  isAuthenticated():boolean{
    const token = this.getFromStorageAndDecrypt("token");
    return !!token;
  }

  isAdmin():boolean {
    const role = this.getFromStorageAndDecrypt("role");
    return role === "ADMIN";
  }

}