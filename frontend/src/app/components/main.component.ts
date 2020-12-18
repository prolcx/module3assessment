import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import {CameraService} from '../camera.service';
import { DailyService } from '../daily.service';


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

	insertForm: FormGroup
	imagePath = '/assets/cactus.png'
	imageData: any
	img = this.cameraSvc.getImage()

	constructor(private cameraSvc: CameraService, private fb: FormBuilder, private dailySvc: DailyService, private router: Router) { }

	ngOnInit(): void {
	  this.insertForm = this.createForm()

	  if (this.cameraSvc.hasImage()) {
		  const img = this.cameraSvc.getImage()
		  this.imagePath = img.imageAsDataUrl
	  }
	}

	private createForm(): FormGroup{
		return this.fb.group({
		  image: this.fb.control(this.img, Validators.required),
		  title: this.fb.control('', Validators.required),
		  comments: this.fb.control('', Validators.required)
	
		})
	  }

	clear() {
		this.imagePath = '/assets/cactus.png'
		this.insertForm.reset()
	}

	share() {
		const title = this.insertForm.get('title').value
		let comments = this.insertForm.get('comments').value
		

		const img = this.cameraSvc.getImage()
		const imageData = img.imageData

		console.log('dddd')
		console.log(title)
		console.log(comments)
		
		const formData = new FormData();
		formData.set('title', this.insertForm.get('title').value);
		formData.set('comments', this.insertForm.get('comments').value);
		formData.set('upload', imageData);

		
		
		this.dailySvc.postDaily(formData)
		.then((result)=>{
			console.log(result)
			this.clear()
		})
		.catch((e)=>{
			console.log(e)
		})
	}
}
