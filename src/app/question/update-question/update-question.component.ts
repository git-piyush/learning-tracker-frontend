import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../service/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../category/service/category.service';
import { QuestionService } from '../service/question.service';

@Component({
  selector: 'app-update-question',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './update-question.component.html',
  styleUrl: './update-question.component.css'
})
export class UpdateQuestionComponent  implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private categoryService: CategoryService,
    private questionService: QuestionService
  ){}

  qId: string='';
  category:string = '';
  subCategory:string='';
  type:string='';
  question:string='';
  bookmark:string='';
  level:string='';
  answer:string='';
  imageUrl:string='';
  imageFile:File | null = null;
  categories:any[] = []
  message:string = ''
  categoryList: String[] = [];
  subCategoryList:string[] = [];

  ngOnInit(): void {
    this.loadDropDown();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchProductById(id);
    }
  }


  //GET ALL CATEGORIES
  loadDropDown():void{
    this.categoryService.getCategoryList().subscribe({
      next: (res)=>{
        this.categoryList = res.categoryList;
        console.log(this.categoryList);
      },error:(err)=>console.error(err)
    });
  }
  fetchProductById(productId: string):void{
    this.questionService.getQuestionById(productId).subscribe({
      next:(res:any) =>{
        console.log(res);
        this.loadSubcategory(res.question.category);
        if (res.status === 200) {
          
          const q = res.question;
        this.qId=q.id;
        this.category = q.category;
        this.subCategory = q.subCategory;
        this.bookmark = q.bookmark;
        this.type = q.type;
        this.level = q.level;
        this.question = q.question;
        this.answer = q.answer;


        // 🔹 Image preview (if image exists)
        if (q.image) {
          this.imageUrl = `data:image/png;base64,${q.image}`;
        }
          
        }else{
          this.showMessage(res.message);
        }
      },
      error:(error) =>{
        this.showMessage(error?.error?.message || error?.message || "Unable to get all categories" + error)
      }})
  }

  getImageSrc(base64String: string): string {
        if (!base64String) {
          return '';
        }
        return 'data:image/jpeg;base64,' + base64String;
  }

  handleImageChange(event: Event):void{
    const input = event.target as HTMLInputElement;
    if (input?.files?.[0]) {
      this.imageFile = input.files[0]
      const reader = new FileReader();
      reader.onloadend = () =>{
        this.imageUrl = reader.result as string
      }
      reader.readAsDataURL(this.imageFile);
    }
  }

  handleSubmit(event : Event):void{
    event.preventDefault()
    const formData = new FormData();
    formData.append("id", this.qId);
    formData.append("category", this.category);
    formData.append("type", this.type);
    formData.append("bookmark", this.bookmark);
    formData.append("level", this.level);
    formData.append("question", this.question);
    formData.append("answer", this.answer);
    formData.append("subCategory", this.subCategory);
    if (this.imageFile) {
      formData.append("imageFile", this.imageFile);
    } 
    
     formData.forEach((value, key) => {
      console.log(key, value);
    });
    
    this.questionService.updateProduct(formData).subscribe({
        next:(res:any) =>{
          if (res.status === 200) {
            this.showMessage("Question Updated successfully.")
            this.router.navigate(['/all-question'])
          }
        },
        error:(error) =>{
          this.showMessage(error?.error?.message || error?.message || "Unable to update" + error)
        }})
   }

  loadSubcategory(cat:string):void{
    this.categoryService.getSubCategoryMap(cat).subscribe({
      next: (res)=>{
        this.subCategoryList = res.subCategoryList;
        console.log(this.subCategoryList);
      },error:(err)=>console.error(err)
    });
    this.subCategoryList[0]="JAVA Basics";
    console.log(this.subCategoryList);
  }

  onChangeCategory(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const category1 = selectElement.value;
    this.categoryService.getSubCategoryMap(category1).subscribe({
      next: (res)=>{
        this.subCategoryList = res.subCategoryList;
        console.log(this.subCategoryList);
      },error:(err)=>console.error(err)
    });
  }

  showMessage(message:string){
    this.message = message;
    setTimeout(() =>{
      this.message = ''
    }, 4000)
  }
}
