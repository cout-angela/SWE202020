$(document).ready(function(){

  var twit = false;
  var maps = false;

  // Cambio testo per procedere
  $("#twit_submit_btn").on('click', function(){
    twit = true;
    if(maps == true){
      $('#next_page_lbl').text("Proceed");
    }
    return false;
  });

  $("#maps_submit_btn").on('click', function(){
    maps = true;
    if(twit == true){
      $('#next_page_lbl').text("Proceed");
    }
    return false;
  });
});