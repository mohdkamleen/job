
        function loadFun() {
            setTimeout(() => {
                document.getElementById("motor").click();
                document.body.style.background = "#ffffff"; 
            }, 7200000);   

    var fconfig = {
        apiKey: "AIzaSyDc5timuQtu7Y4ZxFHafV-NTwT4sU29u8w",
        authDomain: "kdt-143.firebaseapp.com",
        databaseURL: "https://kdt-143-default-rtdb.firebaseio.com",
        projectId: "kdt-143",
        storageBucket: "kdt-143.appspot.com",
        messagingSenderId: "559265165592"
    };
    firebase.initializeApp(fconfig);
    firebase.database().ref("motor").on('value', function (snapshot) {
        var state = snapshot.val(); 
        if(state == 1){
            document.body.style.background = "radial-gradient(rgb(13, 219, 6), rgb(255, 255, 255))";
        } else {
            document.body.style.background = "radial-gradient(#ff0000,rgba(250, 250, 250, 0))";
        }
    })  
}  