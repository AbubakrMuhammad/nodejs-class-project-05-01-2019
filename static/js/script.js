/**********************
 SCRIPT FOR INDEX.HTML
**********************/

$(document).ready(function() {
  $(".form-login input[type='text']").focus();

  flip("login");
  flip("signup");
  flip("profile");
  flip("pic");
  isFormValid("login");
  isFormValid("signup");

  // FLIP ANIMATION
  function flip(divName) {
    $(`.flip-${divName}`).click(function(e) {
      e.preventDefault();
      if (divName == "login") {
        $(`.form-signup input[type='text']`).focus();
        $(".flip-card").css("transform", "rotateY(180deg)");
      } else if (divName == "signup") {
        $(`.form-login input[type='text']`).focus();
        $(".flip-card").css("transform", "rotateY(360deg)");
      } else if (divName == "profile") {
        $(".flip-card").css("transform", "rotateY(180deg)");
      } else if (divName == "pic") {
        $(".flip-card").css("transform", "rotateY(360deg)");
      }
    });
  }

  // FORM VALIDATION
  function isFormValid(formName) {
    $(`.form-${formName} input[type!='submit']`).each(function() {
      // VALIDATION ON BLUR
      $(this).on("blur", function() {
        if (
          $(this)
            .val()
            .trim() === ""
        ) {
          $(this).css({
            "border-color": "#ff0000",
            "background-color": "#ffcccc"
          });
          $(this)
            .next(".form-alert")
            .text(`${$(this).attr("name")} is required.`);
          $(this)
            .next(".form-alert")
            .css({ visibility: "visible" });
        }
      });
      
      // VALIDATION ON INPUT
      $(this).on("input", function() {
        if (
          $(this)
            .val()
            .trim() !== ""
        ) {
          $(this).css({
            "border-color": "#4ea1d8",
            "background-color": "#eef9fe"
          });
          $(this)
            .next(".form-alert")
            .css({ visibility: "hidden" });
        } else {
          $(this).css({
            "border-color": "#ff0000",
            "background-color": "#ffcccc"
          });
          $(this)
            .next(".form-alert")
            .css({ visibility: "visible" });
        }
      });
    });
  }

  // FILE INPUT
  $(".input-file").on("change", function(e) {
    let fileName = e.target.value.split("\\").pop();
    if (fileName.length > 20) {
      let ext = fileName.slice(-3);
      fileName = fileName.slice(0, 20);
      fileName += `….${ext}`;
    }
    const labelValue = $(this)
      .next("label")
      .children("span")
      .text();
    if (fileName) {
      $(this)
        .next("label")
        .children("span")
        .text(fileName);
    } else {
      $(this)
        .next("label")
        .children("span")
        .text(labelValue);
    }
  });
});
