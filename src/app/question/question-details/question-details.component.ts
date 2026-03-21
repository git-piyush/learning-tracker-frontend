import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from '../../category/service/category.service';
import { FormBuilder, FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { QuestionService } from '../service/question.service';
import { Newlinepipe } from '../../shared/newlinepipe';

export interface InterviewQuestion {
  id: string;
  question: string;
  answer: string;
  addedBy: string;
  createdDate: Date;
  modifiedDate:Date;
  expanded?: boolean;
  parentQuestionId: string;
 
}

@Component({
  selector: 'app-question-details',
  standalone: true,
  imports: [CommonModule, FormsModule, Newlinepipe],
  templateUrl: './question-details.component.html',
  styleUrl: './question-details.component.css'
})
export class QuestionDetailsComponent implements OnInit{

  interviewQuestions: InterviewQuestion[] = [];

  isModalOpen = false;
  isEditMode = false;
  modalForm: Partial<InterviewQuestion> = {};

  constructor(private route: ActivatedRoute, private categoryService: CategoryService,
    private router: Router,private fb: FormBuilder, private http: HttpClient,
     private questionService: QuestionService){}
  
  questionId!: string;
  question :any;

  hasPrev = true;
  hasNext = true;

  ngOnInit(): void {
    this.questionId = this.route.snapshot.paramMap.get('qId') || '';
    this.loadQuestionDetails(this.questionId);
    this.loadInterviewQuestions(this.questionId);
  }

    loadQuestionDetails(qId: string): void {
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

    editQuestion(id:string):void{
      this.router.navigate([`/update-question/${id}`]);
    }

    prevQuestion(id:string) {
      this.questionService.getPrevQuestionById(id).subscribe({
            next: (res)=>{
                this.question = res.question;
                this.loadInterviewQuestions(id);
              },error:(err)=>console.error(err)
        });
        
    }

    nextQuestion(id:string) {
      this.questionService.getNextQuestionById(id).subscribe({
            next: (res)=>{
                this.question = res.question;
                this.loadInterviewQuestions(id);
              },error:(err)=>console.error(err)
        });
    }

    imageErrored = false;

    onImageError(event: Event) {
      (event.target as HTMLImageElement).src = 'defaultquestion.png';
      this.imageErrored = true;
    }


    goBack() {
      // logic to navigate back
    }

  // ─── Interview Questions ──────────────────────────────────

  loadInterviewQuestions(parentId: string): void {
    this.questionService.getInterviewQuestions(parentId).subscribe({
      next: (res) => {
        this.interviewQuestions = res.interviewQuestionDTOList;
      }
    });
  }

  toggleAnswer(iq: InterviewQuestion): void {
    iq.expanded = !iq.expanded;
  }

  // ─── Add ─────────────────────────────────────────────────

  openAddModal(): void {
    this.isEditMode = false;
    this.modalForm = {
      question: '',
      answer: '',
      expanded: false,
      parentQuestionId: this.question.id
    };
    this.isModalOpen = true;
  }

  // ─── Edit ────────────────────────────────────────────────

  editInterviewQuestion(iq: InterviewQuestion): void {
    this.isEditMode = true;
    this.modalForm = { ...iq };
    this.isModalOpen = true;
  }

  // ─── Save (Add or Update) ─────────────────────────────────

  saveInterviewQuestion(): void {
    if (!this.modalForm.question?.trim() || !this.modalForm.answer?.trim()) {
      alert('Question and Answer are required.');
      return;
    }
    if (this.isEditMode && this.modalForm.id) {
      this.questionService.updateInterviewQuestion(this.modalForm as InterviewQuestion).subscribe({
        next: (updated) => {
          const index = this.interviewQuestions.findIndex(q => q.id === updated.interviewQuestionDTO.id);
          if (index > -1) {
            this.interviewQuestions[index] = { ...updated.interviewQuestionDTO, expanded: false?false:true };
          }
          this.closeModal();
        },
        error: (err) => console.error('Failed to update', err)
      });
    } else {
      const newIQ: Partial<InterviewQuestion> = {
        ...this.modalForm,
        parentQuestionId: this.question.id,
        createdDate: new Date()
      };
      this.questionService.addInterviewQuestion(newIQ).subscribe({
        next: (res) => {
          console.log(res);
          this.interviewQuestions.push({ ...res.interviewQuestionDTO, expanded: false?false:true });
          this.closeModal();
        },
        error: (err) => {
          console.error('Failed to add', err.error.message);
        }
      });
    }
  }

  // ─── Delete ───────────────────────────────────────────────

  deleteInterviewQuestion(id: string): void {
    if (!confirm('Delete this interview question?')) return;
    this.questionService.deleteInterviewQuestion(id).subscribe({
      next: () => {
        this.interviewQuestions = this.interviewQuestions.filter(q => q.id !== id);
      },
      error: (err) => console.error('Failed to delete', err)
    });
  }

  // ─── Close Modal ──────────────────────────────────────────

  closeModal(): void {
    this.isModalOpen = false;
    this.modalForm = {};
  }
}

