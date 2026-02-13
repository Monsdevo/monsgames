function checkInput(event){

    if(event.keyCode === 13){
        const inputValue = document.getElementById("searchbox").value;
        if(inputValue.toLowerCase() === "test"){
            alert("test");
        }
    }
}