"use strict";

var submission = {};

(function() {
  var max_file_kb = 1024 // 1MB
  // for upload package
  var filename = null
  var payload = null

  // code review object
  var cr = null

  function init() {
    $("#project_file").change(submission.openFile)
    $("#project_id").change(function() {
      $("#submission_status").html("")
    })

    common.signinCallback = submission.lookupNetId
  }

  submission.uploadCode = function() {
    var project_id = $("#project_id").val()

    var data = {
      "fn": "project_upload",
      "project_id": project_id,
      "filename": filename,
      "payload": payload
    }
    common.callLambda(data, function(data) {
      console.log("project uploaded")
      common.popThankYou()

      // try to preview right after a submission
      cr = data.body.code_review
      if (cr) {
        refreshProjectStatus()
        if ("analysis" in cr && cr.analysis.errors) {
          common.popError("there were problems with your submission (check specifics in Step 4)")
        }
      }

      $("#project_file").val(null);
      $("#submit_button").prop('disabled', true)
    })
  };

  submission.withdrawSubmission = function() {
    var project_id = $("#project_id").val()

    var data = {
      "fn": "project_withdraw",
      "project_id": project_id,
    }
    common.callLambda(data, function(data) {
      console.log("project submission withdrawn")

      // clear preview
      $("#submission_status").html("<h2>submission withdrawn</h2>")
    })
  };
  
  function refreshProjectStatus() {
    if (Object.keys(cr.project.files).length == 0) {
      $("#submission_status").html("no files found")
      return
    }

    var html = '<h3>Submission Details</h3>'

    if ("analysis" in cr) {
      html += '<ul>'
      for (var i in cr.analysis.comments) {
        var comment = cr.analysis.comments[i]
        html += '<li>' + comment
      }
      html += '</ul>'
    } else {
      html += "<p>...missing...</p>"
    }

    $("#submission_status").html(html)
  }
  
  submission.checkProjectStatus = function() {
    var project_id = $("#project_id").val()

    // we fetch the code as a CR, even though we don't display
    // highlights.  We also do force_new to get latest code (not
    // previous code that may have already been reviewed).
    var data = {
      "fn": "get_code_review",
      "project_id": project_id,
      "submitter_id": common.getGoogleUserId(), // submitted by self
      "force_new": true
    }
    common.callLambda(data, function(data) {
      cr = data.body
      refreshProjectStatus()
    })
  };

  submission.viewCodeReview = function() {
    var submitter_id = common.getGoogleUserId() // submitted by self
    var project_id = $("#project_id").val()
    var url = "code_review.html?project_id="+project_id+"&submitter_id="+submitter_id
    window.open(url)
  };

  submission.openFile = function(event) {
    var reader = new FileReader();
    var file = event.target.files[0]

    reader.onload = function() {
      var b64contents = btoa(reader.result)
      filename = null
      payload = null

      if (file.name.endsWith('.py') || file.name.endsWith('.ipynb')) {
        if (reader.result.length <= max_file_kb*1024) {
          filename = file.name
          payload = b64contents
          $("#submit_button").prop('disabled', false)
        } else {
          common.popError("max file size is "+max_file_kb+"KB")
          $("#submit_button").prop('disabled', true)
        }
      } else {
        common.popError("only .py or .ipynb are accepted")
        $("#submit_button").prop('disabled', true)
      }
    };

    reader.readAsBinaryString(file)
  }

  submission.lookupNetId = function() {
    var data = {
      "fn": "get_net_id",
    }
    common.callLambda(data, function(data) {
      if (data.body.net_id != null) {
        $("#link_code").val("linked to " + data.body.net_id)
        $("#link_code").prop("disabled", true)
        $("#link_button").prop("disabled", true)
      } else {
        common.popError("for your work to be counted, please logoff and sign back in with your @wisc.edu")
      }
    })
  }

  init()
})()
