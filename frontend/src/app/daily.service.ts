import { HttpClient, HttpParams} from '@angular/common/http'
import { Injectable } from "@angular/core";

const SERVER_INSERT = '/'
const SERVER_INSERT_DAILY = '/daily'

@Injectable()

export class DailyService {
    constructor(private http: HttpClient){

    }

    //2 types of get method:
    //(1) without input
    //(2) with input (params / query)


    async postLogin(loginData): Promise<any>{
        console.log(loginData.username)
        return await this.http.post<any>(SERVER_INSERT, loginData)
        .toPromise()
    }

    async postDaily(dailyData): Promise<any>{
        console.log(dailyData)
        return await this.http.post<any>(SERVER_INSERT_DAILY, dailyData)
        .toPromise()
    }


    }


    //3 types of post content type:
    //(1) multipart/ form-data
    //(2) application/json
    //(3) application/x-www-form-urlencoded

    //(1)
    // refer to day 24 (for frontend) and day 7 (for backend)
    // posting blob and text files
    //
    // async postWineDetail(id, formData): Promise<any>{
    //      return await this.http.post<any>(`${urlResource}${id}`, formData)
    //      .toPromise()
    //
    //***formation of formData
    // const formData = new FormData()
    // formData.set('datafield', <value from form field>)
    
    //(2)
    //post case with content type:' application/json ', in express must use express.json and retrieve via req.body
    //data = {data1: value1, data2, value2}
    // refer to day 5
    //
    // async postWineDetail(id, data): Promise<any>{
    //     return await this.http.post<any>(`${SERVER_WINEDETAIL}${id}`, data)
    //     .toPromise()
    // }

    //(3)
    //post case with content type:' application/x-www-form-urlencoded ', in express must use express.urlencoded and retrieve via req.body
    //refer to camera photo 'NgPostUrlEncoded'

    // async postWineDetail(id, data): Promise<any>{
    //     return await this.http.post<any>(`${SERVER_WINEDETAIL}${id}`, params.toString(), {headers})
    //     .toPromise()
    // }





    //for angular-express linkup, both size have to recognise (1) method, (2) resource(endpoint), (3) content-type




