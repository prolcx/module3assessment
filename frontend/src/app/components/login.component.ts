import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


import { DailyService } from '../daily.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  dailyForm: FormGroup
	errorMessage = ''

	constructor(private fb: FormBuilder, private dailySvc: DailyService, private router: Router) { }

	ngOnInit(): void {
    this.dailyForm = this.createForm()
   }

   private createForm(): FormGroup{
    return this.fb.group({
      username: this.fb.control('', [Validators.required]),
      password: this.fb.control('', [Validators.required])

    })
  }


  login(){
    // const formData = new FormData();
    // formData.set('username', this.dailyForm.get('username').value);
    // formData.set('password', this.dailyForm.get('password').value);
    let username = this.dailyForm.get('username').value
    let password = this.dailyForm.get('password').value

    this.dailySvc.postLogin({username, password})
      .then((result)=>{
        console.log(result)

        if(result=='ok'){
          this.router.navigate([ '/main' ])
        }

      })
      .catch((e)=>{
        this.errorMessage = e.error.message
        console.log(e)
      })
    
  }
}

