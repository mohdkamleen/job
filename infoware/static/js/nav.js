var bars = document.getElementsByClassName("ham_toggle")[0]; 
var nav = document.getElementsByClassName("nav")[0];  
var logo = document.getElementsByClassName("logo")[0];  
var copyright = document.getElementsByClassName("copyright")[0];  

bars.addEventListener("click", function(){ 
    nav.classList.toggle("active"); 
    logo.classList.toggle("active");  
    copyright.classList.toggle("active");  
    this.classList.toggle("fa-bars"); 

}); 

setTimeout(() => {
    document.getElementById("msg").style.display='none';
}, 5000);
   