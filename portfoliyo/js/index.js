var bars = document.getElementsByClassName("ham_toggle")[0]; 
var nav = document.getElementsByClassName("nav")[0];  
var logo = document.getElementsByClassName("logo")[0];  

bars.addEventListener("click", function(){ 
    nav.classList.toggle("active"); 
    logo.classList.toggle("active");  
    this.classList.toggle("fa-bars"); 

}); 
  