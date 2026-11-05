'use strict';
// This page never resumes the city merely by being opened.
document.querySelector('#care-return').addEventListener('click',()=>{
 try{sessionStorage.setItem('genug-return-city','yes');}catch{}
 location.href='spielen.html';
});
