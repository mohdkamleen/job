var hamburger = document.getElementsByClassName("hamburger")[0];
var copyright = document.getElementsByClassName("copyright")[0];
var imageBack = document.getElementsByClassName("image-back")[0];
var nav = document.getElementsByTagName("nav")[0];

document.body.onresize = (e) => {
    if(e.target.innerWidth > 900){
        nav.classList.remove("active"); 
        imageBack.classList.remove("active"); 
        copyright.classList.remove("active"); 
        hamburger.classList.replace("fa-times","fa-bars");
    }

}

hamburger.addEventListener("click", () =>{
    nav.classList.toggle("active"); 
    imageBack.classList.toggle("active"); 
    copyright.classList.toggle("active"); 

    if(hamburger.className === "hamburger fa fa-bars"){
         hamburger.classList.replace("fa-bars","fa-times"); 
    } else {
        hamburger.classList.replace("fa-times","fa-bars");
    }
})


//------------------ typing js --------------------//

var typed = new Typed('.type_text', {
    strings: ["", " Web Developer", " Web Designer", "Programmer", "Student","Freelancer" ],
    loop: true,
    backSpeed: 30,
    typeDelay: 1000,
    cursorChar: '_',
    typeSpeed: 100

    }); 