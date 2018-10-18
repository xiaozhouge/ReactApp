import $ from 'jquery';
let baseUrl=window.location.origin; 
export default function $Ajax(url,method,params,contentType){
    return new Promise((resolve,reject)=>{
        $.ajax({
            type: method,
            url: baseUrl+url,
            data:JSON.stringify(params),
            contentType:contentType,
            cache: false,
            success: (res)=>{
                if(res.indexOf("{")>=0||res.indexOf("[")>=0){
                    resolve(JSON.parse(res))
                }else{
                    resolve(res)
                }
            }
        });
    })  
}