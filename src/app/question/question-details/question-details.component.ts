import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from '../../category/service/category.service';
import { FormBuilder } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { QuestionService } from '../service/question.service';

@Component({
  selector: 'app-question-details',
  standalone: true,
  imports: [CommonModule, ],
  templateUrl: './question-details.component.html',
  styleUrl: './question-details.component.css'
})
export class QuestionDetailsComponent implements OnInit{

  constructor(private route: ActivatedRoute, private categoryService: CategoryService,
    private router: Router,private fb: FormBuilder, private http: HttpClient,
     private questionService: QuestionService){}
  
  questionId!: string;
  question :any;

  hasPrev = true;
  hasNext = true;

  ngOnInit(): void {
    this.questionId = this.route.snapshot.paramMap.get('qId') || '';
    this.loadQuestionDetaisl(this.questionId);
  }

    loadQuestionDetaisl(qId: string): void {
      this.questionService.getQuestionById(qId).subscribe({
            next: (res)=>{
                this.question = res.question;
                console.log(this.question);
              },error:(err)=>console.error(err)
        });
    }

    getImageSrc(base64String: string): string {
        if (!base64String) {
          return '';
        }
        return 'data:image/jpeg;base64,' + base64String;
      }

  prevQuestion(id:string) {
    alert(id);
  }

  nextQuestion(id:string) {
    alert(id);
  }

  goBack() {
    // logic to navigate back
  }

  changePage(newPage: number): void {
    
  }

  changeSize(event: any): void {
    
  }

  sort(column: string): void {
    
    //this.loadCategories();
  }
}

