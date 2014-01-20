CodeMirror.commands.autocomplete = function(cm) {
    CodeMirror.showHint(cm, CodeMirror.hint.js);
};


var editor = CodeMirror.fromTextArea($("textarea")[0], {
        lineNumbers: true,
        matchBrackets: true,
        continueComments: "Enter",
        autoCloseBrackets: true,
        extraKeys: {
            "Ctrl-Q": "toggleComment",
            "Ctrl-Space": "autocomplete"
        }
    })

  , $definedOperators = $(".defined-operators")
  , $jsCodeToRun      = $(".js-code")
  , $runButton        = $(".run")
  , $output           = $(".output");

function runCode () {
    // eval operators
    try {
        eval ($definedOperators.val());
    } catch (e) {
        return $output.val(e.toString());
    }

    // eval js code
    try {
        var result = eval (evalThis($jsCodeToRun.val()));
    } catch (e) {
        return $output.val(e.toString());
    }

    $output.val(result);
}

$runButton.on("click", runCode);

function visitor(tree,visit){
    for(i in tree){
        visit(tree[i]);
        if(typeof tree[i] === "object" && tree[i] !== null){
            visitor(tree[i],visit);
        }
    }
}

function evalThis (input) {
    var syntax = esprima.parse(input);
    visitor(syntax,function(el){
        if(el.type === "BinaryExpression"){

            if (operators.available.indexOf(el.operator) !== -1){
                el.type = "CallExpression";
                el.callee = {
                    name: operators[el.operator].name,
                    type:"Identifier"
                };
                el.arguments = [el.left, el.right];
                delete el.operator;
                delete el.left;
                delete el.right;
            }
        }
    });

    scriptToEvaluate = escodegen.generate(syntax)
    return eval(scriptToEvaluate);
}
