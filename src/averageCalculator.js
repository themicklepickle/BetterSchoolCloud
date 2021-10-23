// /**
//  * @desc Waits for the main table to load, invokes callback once loaded
//  * @param {String} query Query to wait for
//  * @param {function} cb Callback, gets called after completion
//  */
// const waitForLoad = (query, cb) => {
//   try {
//     if ($(query).length) {
//       // Checks if the table exists
//       cb(); // Invoke callback once found
//     } else {
//       setTimeout(() => {
//         // Calls itself after a second
//         waitForLoad(cb);
//       }, 1000);
//     }
//   } catch (e) {
//     console.log(e); // Catch errors
//   }
// };

/**
 * @desc Extracts classes into array, with weights
 * @param {Array} markBooks Array to hold the class info with multiplier
 */
const grabMarkBooks = (markBooks) => {
  try {
    $(".studentcoursedetail tbody > tr.my-button").each(function (i, row) {
      const $row = $(row);
      const className = $row.find("td:first > span").text(); // Grab the class name from the first column
      const grade = $row.find("td:nth-child(5) > span").text();
      let multiplier = $row.find("td:nth-child(4) > input").val(); // Grab the weight from the third column

      markBooks.push({
        // Adds class to array with a multiplier and its info
        name: className,
        grade: parseFloat(grade),
        multiplier: parseFloat(multiplier), // Holds multiplier/weight of class
        row: $row, // Holds the jQuery selector for the mark row
      });
    });
  } catch (e) {
    console.log(e);
  }
};

/**
 * @desc Appends a column after a specified column index
 * @param {Number} i Index of column to append to
 * @param {String} name Name to give the column header
 * @param {String} html Custom HTML to be injected
 */
const addColumnAfter = (i, name, html) => {
  $(`.studentcoursedetail tr:first th:nth-child(${i}):first`).after(
    `<th align="center">${name}</th>`
  );

  $(`.studentcoursedetail > tbody > tr > td:nth-child(${i})`).each(function () {
    $(this).after($(this).clone().html(html));
  });
};

/**
 * @desc Hides a column at a specified index
 * @param {Number} i Index of column to hide
 */
const hideColumn = (i) => {
  $(`.studentcoursedetail td:nth-child(${i}),th:nth-child(${i})`).each(
    function () {
      $(this).css("display", "none");
    }
  );
};

/**
 * @desc Loops through the markbooks and adds an editable grade input
 */
const addMarksToClassRows = () => {
  window.markBooks.forEach(function (markbook) {
    const markCell = markbook.row.find("td:nth-child(3)");

    if (window.settings.liveModification) {
      markCell.html(
        `<input class="grade" min="0" type="number" value="${markbook.grade}" />`
      );
      const input = markCell.children("input");
      $(input).bind("input", function () {
        let mark = parseFloat($(this).val());
        if (!isNaN(mark)) markbook.grade = mark;
        calculateAverage();
        $(this).parent().css("background-color", "#ffe499"); // Change color of cell to indicate it was modified
      });
    } else {
      markCell.html(`${markbook.grade}`);
    }
  });
};

/**
 * @desc Calculates and updates the averages on the page
 */
const calculateAverage = () => {
  let totalGrades = 0;
  let totalWeightedGrades = 0;
  let totalClasses = 0;
  let totalWeights = 0;
  let average, weightedAverage;
  let markBooks = window.markBooks;

  markBooks.forEach(function (markbook) {
    if (isNaN(parseFloat(markbook.multiplier)) || markbook.multiplier <= 0) {
      // If the class is given a <= 0 or no weighting
      return;
    }

    if (isNaN(parseFloat(markbook.grade))) {
      // If the class has no grade
      return;
    }

    totalGrades += markbook.grade;
    totalWeightedGrades += markbook.multiplier * markbook.grade;
    totalClasses++;
    totalWeights += markbook.multiplier;
  });

  if (totalClasses <= 0 || totalWeights <= 0) {
    // Don't accept zero and negative denominators
    return;
  }

  average = Math.round((totalGrades / totalClasses) * 100) / 100;
  weightedAverage =
    Math.round((totalWeightedGrades / totalWeights) * 100) / 100;

  $("#avg").text(average);
  $("#weightedAvg").text(weightedAverage);
};

/**
 * @desc Sets the initial values for the weights when the page is fresh
 */
const setWeights = () => {
  try {
    if (localStorage.weights) {
      let weights = JSON.parse(localStorage.weights);
      weights.forEach((weight) => {
        $(".studentcoursedetail tr").each(function (i, row) {
          // Loops through each table row
          const $row = $(row); // Get the jQuery object of the row
          if ($row.find("td:first > span").text() === weight.name) {
            // Check if the current row is the class we are looking for
            $row.find("td:nth-child(4) > input").val(weight.weight); // Set the value of the weight if it exists
            return; // Stop the loop and exit the function
          }
        });
      });
    } else {
      const weights = [];

      $(".studentcoursedetail tr.my-button").each(function (i, row) {
        // Loops through each table row
        const $row = $(row); // Get the jQuery object of the row
        const name = $row.find("td:first > span").text();
        const weight = $row.find("td:nth-child(4) > input").val();

        if (!weight) return;

        weights.push({
          name: name,
          weight: parseFloat(weight),
        });
      });

      localStorage.setItem("weights", JSON.stringify(weights));
    }
  } catch (e) {
    console.error(e);
  }
};

/**
 * @desc Updates the values of the weights in local storage when a change is detected
 */
const updateWeights = () => {
  const weights = [];
  let markBooks = window.markBooks;

  $(".studentcoursedetail tr").each(function (i, row) {
    // Loops through each table row
    const $row = $(row); // Get the jQuery object of the row
    const name = $row.find("td:first > span").text();
    const weight = $row.find("td:nth-child(4) > input").val();

    if (!weight) return;

    weights.push({
      name: name,
      weight: parseFloat(weight),
    });
  });

  markBooks.forEach((markbook) => {
    weights.forEach((weight) => {
      if (weight.name === markbook.name) {
        markbook.multiplier = weight.weight;
      }
    });
  });

  localStorage.setItem("weights", JSON.stringify(weights));

  window.markBooks = markBooks;

  calculateAverage();
};

/**
 * @desc Adds a row to the top of the table with two columns
 * @param {String} item Value to display
 * @param {String} itemName Name of the value being displayed
 * @param {String} id The HTML id to be attached to the element
 */
const addItemBeforeTable = (item, itemName, id) => {
  /* Table class contains the letter that corresponds to the next color in the table rows
   * Grabs the table element's last row's block's class, where the letter is extracted
   */

  /* Appends the row to the end of the table */
  $(".studentcoursedetail > tbody > tr:first").before(
    `<tr><td>${itemName}</td><td></td><td id='${id}'>${item}</td><td></td></tr>`
  );
};

/**
 * @desc Parses the injection of averages
 */
const injectScores = async () => {
  try {
    addColumnAfter(
      2,
      "Mark",
      '<input min="0" oninput="updateWeights()" type="number" value="5" step="any">'
    ); // Add the column to hold the modifiable weights
    setWeights(); // Sets the weightings based on localStorage

    addColumnAfter(
      3,
      "Weight",
      '<input min="0" oninput="updateWeights()" type="number" value="5" step="any">'
    ); // Add the column to hold the modifiable weights
    setWeights(); // Sets the weightings based on localStorage

    /* Inject css for the inputs */
    $(".studentcoursedetail").prepend(
      '<style type="text/css">input[type="number"]::-webkit-outer-spin-button,input[type="number"]::-webkit-inner-spin-button {-webkit-appearance: none;margin: 0;}input[type="number"].grade{text-align: left}' +
        'input[type="number"] {-moz-appearance: textfield; margin: 0; border: none; display: inline; font-family: Monaco, Courier, monospace; font-size: inherit; padding: 0; text-align: center; width: 30pt; background-color: inherit;}' +
        'input[type="number"]:hover {text-decoration: none;}</style>'
    );

    hideColumn(5);

    window.markBooks = [];
    grabMarkBooks(window.markBooks); // Grab the markbooks

    if (window.settings.calculation) {
      addItemBeforeTable(
        '<span style="color:LightGrey;">n.a.</span>',
        "Average (Weighted)",
        "weightedAvg"
      );
      addItemBeforeTable(
        '<span style="color:LightGrey;">n.a.</span>',
        "Average",
        "avg"
      );
      calculateAverage();
    }
    if (window.settings.quickview) addMarksToClassRows();
  } catch (e) {
    console.log(e);
  }
};

/**
 * @desc Disables the enter key from submitting the form
 */
const disableEnter = () => {
  $(document).ready(() => {
    $(window).keydown((event) => {
      if (event.keyCode === 13) {
        event.preventDefault();
        return false;
      }
    });
  });
};

/**
 * @desc Main function, initializes the average calculation feature
 */
const init = () => {
  try {
    disableEnter(); // Disable the enter key to prevent unwanted form submission

    // Make anonymous function to be called once 'waitForLoad' is finished
    // waitForLoad(".studentcoursedetail", () => {
    injectScores(); // Call the injection function
    // });
  } catch (e) {
    console.log(e);
  }
};

init(); // Call the initialization function
