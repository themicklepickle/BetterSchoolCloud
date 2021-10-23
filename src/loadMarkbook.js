/* Load Markbook Override (Pre-existing function used when a markbook is opened) */
// loadMarkbook = function (
//   studentID,
//   classID,
//   termID,
//   topicID,
//   title,
//   refresh,
//   stuLetters,
//   orgId
// ) {
//   if (refresh) {
//     studentID = studentID_;
//     classID = classID_;
//     topicID = topicID_;
//     termID = termID_;
//     title = title_;
//     stuLetters = stuLetters_;
//     orgId = orgId_;
//   } else {
//     studentID_ = studentID;
//     classID_ = classID;
//     topicID_ = topicID;
//     title_ = title;
//     termID_ = termID;
//     stuLetters_ = stuLetters;
//     orgId_ = orgId;
//   }

//   $("#MarkbookDialog").dialog("option", "title", title);
//   $("#markbookTable").html(
//     '<div><img alt="Loading...." src="' +
//       mwMrkBookDialogRootPath +
//       'viewer/clsmgr/images/ajax-loader2.gif" />&nbsp;Loading...</div>'
//   );
//   $("#MarkbookDialog").dialog("option", "height", "auto").dialog("open");

//   let fromDate = $("#mrkbkFromDate").datepicker().val();
//   let toDate = $("#mrkbkToDate").datepicker().val();

//   $.ajax({
//     type: "POST",
//     url:
//       mwMrkBookDialogRootPath +
//       "viewer/Achieve/TopicBas/StuMrks.aspx/GetMarkbook",
//     data: JSON.stringify({
//       studentID: studentID,
//       classID: classID,
//       termID: termID,
//       topicID: topicID,
//       fromDate: fromDate,
//       toDate: toDate,
//       relPath: mwMrkBookDialogRootPath,
//       stuLetters: stuLetters || "",
//       orgID: orgId || -1,
//     }),
//     contentType: "application/json; charset=utf-8",
//     dataType: "json",
//     success: function (msg) {
//       $("#MarkbookDialog").dialog("close");
//       $("#markbookTable").html(msg.d);
//       $("#MarkbookDialog").dialog("option", "height", "auto").dialog("open");
//       $("#markbookTable td[mrkTble!='1']").addClass("tdAchievement");
//       fixBgColor();
//       if (settings.liveModification || settings.percentages) {
//         getSelectors();
//       }
//       if (settings.liveModification) {
//         makeMarkbookEditable();
//         createInitialMarkbook();
//       }
//       if (settings.betterTableLayout) {
//         betterTableLayout();
//       }
//       if (settings.percentages) {
//         addPercentages();
//         calculatePercentages();
//       }
//     },
//     error: function () {
//       $("#markbookTable").html("(error loading marbook)");
//       $("#MarkbookDialog").dialog("option", "height", "auto").dialog("open");
//     },
//   });
// };

/**
 * @desc Waits for the main table to load, invokes callback once loaded
 * @param {String} query Query to wait for
 * @param {function} cb Callback, gets called after completion
 */
const waitForLoad = (query, cb) => {
  try {
    if ($(query).length) {
      // Checks if the table exists
      cb(); // Invoke callback once found
    } else {
      setTimeout(() => {
        // Calls itself after a second
        waitForLoad(query, cb);
      }, 500);
    }
  } catch (e) {
    console.log(e); // Catch errors
  }
};

const f = () => {
  console.log("clicked!");
  makeMarkbookEditable();
  createInitialMarkbook();

  // fixBgColor();
  // if (settings.liveModification || settings.percentages) {
  //   getSelectors();
  // }
  // if (settings.liveModification) {
  //   makeMarkbookEditable();
  //   createInitialMarkbook();
  // }
  // if (settings.betterTableLayout) {
  //   betterTableLayout();
  // }
  // if (settings.percentages) {
  //   addPercentages();
  //   calculatePercentages();
  // }
};

const addFunctionBind = () => {
  $(".studentcoursedetail tr.my-button").each(function (i, row) {
    $(row).bind("click", function () {
      waitForLoad("#CourseSummary", f);
    });
  });
};

addFunctionBind();
