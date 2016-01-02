/** spin for process status **/
 function showSpin(){
    if(typeof(Spinner)=='function'){
        var opts = {lines:7, top:'50%',left:'50%'};
        var spinner = new Spinner(opts).spin();
        var spinDIV = createDIV();
        spinDIV.appendChild(spinner.el);
    }
}
//create DIV with full screen 
function createDIV()
{    
    $(document.body).append("<div id='divSpinBackground' style='position:absolute;z-index:99;  background:transparent; top:0; left:0; filter:Alpha(opacity=50);'></div>");
    $('#divSpinBackground').css({height: function () {
            return $(document).height() ;   
            },
            width:"100%"
        });   
    $('#divSpinBackground').show();
    $(document.body).append("<div id='divSpinBox'></div>")
    return document.getElementById("divSpinBox");
}
//remove spin layer
 function clearSpin(){
    $("#divSpinBackground").remove();
    $("#divSpinBox").remove();
 }
 /** spin for process status **/