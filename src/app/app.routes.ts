import { Routes } from '@angular/router';
import { GuardService } from './service/guard.service';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { TransactionComponent } from './transaction/transaction.component';
import { TransactionDetailsComponent } from './transaction-details/transaction-details.component';
import { ProfileComponent } from './profile/profile.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { QuestionListComponent } from './question/question-list/question-list.component';
import { AddQuestionComponent } from './question/add-question/add-question.component';
import { UpdateQuestionComponent } from './question/update-question/update-question.component';
import { CategoryListComponent } from './category/category-list/category-list.component';
import { AddCategoryComponent } from './category/add-category/add-category.component';
import { UpdateCategoryComponent } from './category/update-category/update-category.component';
import { QuestionDetailsComponent } from './question/question-details/question-details.component';

export const routes: Routes = [

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  { path: 'question-details/:qId', component: QuestionDetailsComponent, canActivate:[GuardService], data: {requiresAdmin: true} },
  { path: 'all-question', component: QuestionListComponent, canActivate:[GuardService], data: {requiresAdmin: true} },
  { path: 'add-question', component: AddQuestionComponent, canActivate:[GuardService], data: {requiresAdmin: true} },
  { path: 'update-question/:qId', component: UpdateQuestionComponent, canActivate:[GuardService], data: {requiresAdmin: true} },

  
  { path: 'all-category', component: CategoryListComponent, canActivate:[GuardService], data: {requiresAdmin: true} },
  { path: 'add-category', component: AddCategoryComponent, canActivate:[GuardService], data: {requiresAdmin: true} },
  { path: 'update-category/:catId', component: UpdateCategoryComponent, canActivate:[GuardService], data: {requiresAdmin: true} },
  { path: 'transaction', component: TransactionComponent, canActivate:[GuardService] },
  { path: 'transaction/:transactionId', component: TransactionDetailsComponent, canActivate:[GuardService] },


  { path: 'profile', component: ProfileComponent, canActivate:[GuardService] },
  { path: 'dashboard', component: DashboardComponent, canActivate:[GuardService] },

//   WIDE CARD
    {path: "", redirectTo: "/login", pathMatch: 'full'},
    // {path: "**", redirectTo: "/dashboard"}

];
