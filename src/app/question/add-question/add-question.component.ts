import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../service/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../category/service/category.service';
import { QuestionService } from '../service/question.service';

@Component({
  selector: 'app-add-question',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './add-question.component.html',
  styleUrl: './add-question.component.css'
})
export class AddQuestionComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private categoryService: CategoryService,
    private questionService: QuestionService
  ){}

  qId: string | null = null
  category:string = '';
  subCategory:string='';
  type:string='';
  question:string='';
  bookmark:string='';
  level:string='';
  answer:string='';
  imageUrl:string='';
  imageFile:File | null = null;
  isEditing:boolean = false
  categories:any[] = []
  message:string = ''
  categoryList: String[] = [];
  subCategoryList:string[] = [];





  ngOnInit(): void {
    this.loadDropDown();
    this.qId = this.route.snapshot.paramMap.get('productId');
    
    if (this.qId) {
      this.isEditing = true;
      this.fetchProductById(this.qId)
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


  //GET CATEGORY BY ID

  fetchProductById(productId: string):void{
    this.questionService.getProductById(productId).subscribe({
      next:(res:any) =>{
        if (res.status === 200) {
          const product = res.product;
          this.category = product.category;
          this.imageUrl = product.imageUrl;
        }else{
          this.showMessage(res.message);
        }
      },
      error:(error) =>{
        this.showMessage(error?.error?.message || error?.message || "Unable to get all categories" + error)
      }})
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
    formData.append("category", this.category);
    formData.append("type", this.type);
    formData.append("bookmark", this.bookmark);
    formData.append("level", this.level);
    formData.append("question", this.question);
    formData.append("answer", this.answer);
    formData.append("subCategory", this.subCategory);
    formData.forEach((value, key) => {
      console.log(key, value);
    });
    if (this.imageFile) {
      formData.append("imageFile", this.imageFile);
    }   

    if (this.isEditing) {
      formData.append("qId", this.qId!);
      this.questionService.updateProduct(formData).subscribe({
        next:(res:any) =>{
          if (res.status === 200) {
            this.showMessage("product updated successfully")
            this.router.navigate(['/product'])
          }
        },
        error:(error) =>{
          this.showMessage(error?.error?.message || error?.message || "Unable to update a product" + error)
        }})
    }else{
      this.questionService.addQuestion(formData).subscribe({
        next:(res:any) =>{

          if (res.status === 200) {
            this.showMessage("Question Saved successfully.")
            this.router.navigate(['/all-question'])
          }
        },
        error:(error) =>{
          this.showMessage(error?.error?.message || error?.message || "Unable to save a Question" + error)
        }})
      }
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