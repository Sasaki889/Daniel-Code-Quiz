
import gutil from "../../libs/gutil.js";
import eutil from "../../libs/eutil.js";
import { QuizBuilder, Question } from "../../libs/quizbuilder.js";


gutil.enableDebugMode();


const $startQuizButton = document.querySelector("#start-quiz-button");
const $introScreen = document.querySelector("#intro-screen");
const $questionScreen = document.querySelector("#question-screen");
const $infoBar = document.querySelector("#top-bar-info");
const $timerDisplay = $infoBar.querySelector("p"); // timer display element
const $answerButtonContainer = $questionScreen.querySelector("ul");
const $finishScreen = document.querySelector("#finish-screen");
const $main = document.querySelector("main");
const $questionFeedback = document.querySelector("#question-feedback");
const $scoreEntryContainer = document.querySelector("#score-entry");
const $submitScoreButton = $scoreEntryContainer.querySelector("button");
const $initialsTextField = $scoreEntryContainer.querySelector("input");
const $highscoresScreen = document.querySelector("#highscores-screen");
const $viewHighscoresButton = $infoBar.querySelector("button");


let $currentWindow = $introScreen;
let $prevWindow = $introScreen;


// main quiz interface
const quiz = new QuizBuilder();

// start adding questions
quiz.addQuestion(
    new Question("Which one is an example of an array?")
        .setRightAnswer("var array = []")
        .setChoices("var array = {}", "var array = ()", "var array = <>")
);

quiz.addQuestion(
    new Question("Which DOM method is used to create a new HTML element?")
        .setRightAnswer("document.createElement()")
        .setChoices("document.newElement()", "document.element()", "document.spawnElement()")
);

quiz.addQuestion(
    new Question("True or False: Functions can be passed as arguments to other functions.")
        .setRightAnswer("true")
        .setChoices("false")
);

quiz.addQuestion(
    new Question("What operator is used to represent AND statements?")
        .setRightAnswer("&&")
        .setChoices("||", "+", "&")
);

quiz.addQuestion(
    new Question("True or False: jQuery is a different language from JavaScript.")
        .setRightAnswer("false")
        .setChoices("true")
);

quiz.addQuestion(
    new Question("Which of the following is an example of a valid variable assignment?")
        .setRightAnswer("All Choices.")
        .setChoices("const x = \"string\";", "let y = 10;", "var z = [];")
);

quiz.addQuestion(
    new Question("Which operator will compare if two literals are the exact same?")
        .setRightAnswer("===")
        .setChoices("==", "*=", "!=")
);

function updateQuizTimer(time) {
    $timerDisplay.textContent = "Time Left: " + time;
}


function switchScreen($newScreen) {
    if ($newScreen === $currentWindow) return;
    eutil.hideElement($currentWindow);
    $prevWindow = $currentWindow;
    eutil.showElement($newScreen);
    $currentWindow = $newScreen;

    
    if (quiz.currentQuestionIndex > 0) {
        eutil.showElement($main);
    } else {
        eutil.hideElement($main, true);
    }
}


function generateNextQuestion() {
    eutil.clearChildrenOnElement($answerButtonContainer); 
    eutil.hideElement($questionFeedback);       

    const question = quiz.getNextQuestion();    
    if (!question) return;                      

    
    const answerChoices = question.getRandomChoices();

    
    const $questionTitle = $questionScreen.querySelector("h2");
    const $questionFeedbackTitle = $questionFeedback.querySelector("p");

    
    eutil.generateDynamicText($questionTitle, [
        {content: "Q." + quiz.currentQuestionIndex + ") "},
        {content: question.title}
    ]);

    
    answerChoices.forEach((choice) => {
        
        const $li = document.createElement("li");
        const $button = document.createElement("button");

        
        $button.textContent = choice;

       
        $li.appendChild($button);
        $answerButtonContainer.appendChild($li);

        
        $li.style.minHeight = $li.clientHeight + "px";
        $button.style.minHeight = $li.style.minHeight;

        
        question.setButtonForChoice($button, choice)
    });

    
    question.onAnswerStateChanged.connect("onAnswer", (input, state) => {
        gutil.debugPrint("answer selected (answer state: " + state + ") answer:", input);
        question.onAnswerStateChanged.disconnect("onAnswer");

        let correctColor = "#88dc8a";
        let incorrectColor = "#bb2f2f";

        for (let [button, choice] of question.buttons) {
            if (choice === input) {
                button.parentElement.style.width = "60%"; 

                
                if (state === "correct") {
                    $questionFeedbackTitle.style.color = correctColor;
                    $questionFeedbackTitle.textContent = "Correct!";
                } else {
                    
                    button.style.backgroundColor = incorrectColor;
                    $questionFeedbackTitle.style.color = incorrectColor;
                    $questionFeedbackTitle.textContent = "Incorrect";
                    quiz.subtractTime(5);
                    updateQuizTimer(quiz.getTimeLeft());
                }
            }

            
            if (choice === question.rightAnswer) {
                button.style.backgroundColor = "#39912b";
            }
        }

        eutil.showElement($questionFeedback);
        setTimeout(generateNextQuestion, 2000);
    });
}


function onAnswerSelected(event) {
    event.stopPropagation(); 

    const currentQuestion = quiz.getCurrentQuestion();  
    const $answerSelected = event.target;               
    const answerChoice = currentQuestion.buttons.get($answerSelected); 

    
    if (!answerChoice) {
        gutil.debugPrint("some other element was clicked");
        return;
    }

    
    currentQuestion.answer(answerChoice);
}


function onQuizStart() {
    gutil.debugPrint("The quiz has started!");

    
    switchScreen($questionScreen);
    eutil.showElement($main);

    quiz.isSubmitted = false;
    quiz.randomizeQuestions();          
    quiz.setDuration(60);               
    quiz.startTimer(updateQuizTimer);   

    $answerButtonContainer.addEventListener("click", onAnswerSelected); 

    
    generateNextQuestion();
}


function onQuizFinish(finishState) {
    gutil.debugPrint("The quiz has been finished! Finish state: " + finishState);
    gutil.debugPrint("User finished quiz with score of: " + quiz.getScore());
    $answerButtonContainer.removeEventListener("click", onAnswerSelected); // remove previous click listener for answer container

    
    switchScreen($finishScreen);
    eutil.showElement($main);

   
    const $scoreDisplay = $finishScreen.querySelector(".finish-screen > p");
    $scoreDisplay.textContent = "Final Score: " + quiz.getScore();
}

function onClearHighscores() {
    let hsData = localStorage.clear() 
    viewHighScores();
}


function onGoBack() {
    if (quiz.currentQuestionIndex <= 1 && quiz.isSubmitted) {
        switchScreen($introScreen); 
        eutil.hideElement($main, true);
    } else if (!quiz.isSubmitted) {
        switchScreen($prevWindow); 
        eutil.showElement($main);
    } else {
        switchScreen($prevWindow);
    }

}


function viewHighScores(hsData) {

    
    let newData = JSON.parse(localStorage.getItem("highscores") || "[]");

    if (hsData) {
        newData.push(hsData);
        localStorage.setItem("highscores", JSON.stringify(newData));
    }

    
    switchScreen($highscoresScreen);
    eutil.showElement($main);

    const $highscoresContainer = $highscoresScreen.querySelector("ol");
    eutil.clearChildrenOnElement($highscoresContainer);

    
    for (let i = 0; i < newData.length; i++) {
        let data = newData[i];
        let $li = document.createElement("li");
        $li.textContent = data.author + " - " + data.score + " | " + data.status;
        $highscoresContainer.appendChild($li);
    }

    
    const $goBackButton = $highscoresScreen.querySelector("#go-back-btn");
    const $clearScoresButton = $highscoresScreen.querySelector("#clear-scores-btn");

    
    $goBackButton.removeEventListener("click", onGoBack);
    $clearScoresButton.removeEventListener("click", onClearHighscores);

    
    $goBackButton.addEventListener("click", onGoBack);
    $clearScoresButton.addEventListener("click", onClearHighscores);

}

function onSubmitScore() {
    const initials = $initialsTextField.value.trim();

    if (!initials) return; 
    quiz.isSubmitted = true;
    console.log("quiz submitted:", quiz.isSubmitted);
    viewHighScores({author: initials, score: quiz.lastScore, status: quiz.finishState});
}

function initializeElements() {
   
    eutil.addToPropertyCache($infoBar, {"style": {"display": true}});
    eutil.addToPropertyCache($questionScreen, {"style": {"display": true}});
    eutil.addToPropertyCache($introScreen, {"style": {"display": true}});
    eutil.addToPropertyCache($questionFeedback, {"style": {"display": true}});

    eutil.hideElement($main, true);
}

document.addEventListener("readystatechange", () => {
    if (document.readyState === "complete") {
        gutil.debugPrint("ready state:", document.readyState);
        initializeElements();
    }
}); 


quiz.onQuizFinish.connect("onQuizFinish", onQuizFinish);
$startQuizButton.addEventListener("click", onQuizStart);
$submitScoreButton.addEventListener("click", onSubmitScore);
$viewHighscoresButton.addEventListener("click", () => viewHighScores());