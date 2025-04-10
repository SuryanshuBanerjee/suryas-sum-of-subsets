document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const inputSetElement = document.getElementById('input-set');
    const targetSumElement = document.getElementById('target-sum');
    const solveButton = document.getElementById('solve-btn');
    const stepButton = document.getElementById('step-btn');
    const resetButton = document.getElementById('reset-btn');
    const originalSetDisplay = document.getElementById('original-set');
    const targetDisplay = document.getElementById('target-display');
    const currentSubsetDisplay = document.getElementById('current-subset');
    const currentSumDisplay = document.getElementById('current-sum');
    const executionLogElement = document.getElementById('execution-log');
    const decisionTreeElement = document.getElementById('decision-tree');
    const solutionsElement = document.getElementById('solutions');

    // State variables
    let inputSet = [];
    let targetSum = 0;
    let simulationSteps = [];
    let currentStepIndex = 0;
    let solutions = [];
    let stepMode = false;

    // Initialize the application
    function initialize() {
        // Parse input set
        inputSet = inputSetElement.value.split(',')
            .map(num => parseInt(num.trim()))
            .filter(num => !isNaN(num));
        
        // Sort for better visualization
        inputSet.sort((a, b) => a - b);
        
        // Parse target sum
        targetSum = parseInt(targetSumElement.value);
        
        // Reset state
        simulationSteps = [];
        currentStepIndex = 0;
        solutions = [];
        
        // Update UI
        updateOriginalSetDisplay();
        targetDisplay.textContent = targetSum;
        currentSubsetDisplay.innerHTML = '<span class="empty-message">Empty</span>';
        currentSumDisplay.textContent = '0';
        executionLogElement.innerHTML = '';
        decisionTreeElement.innerHTML = '';
        solutionsElement.innerHTML = '<span class="empty-message">Run the algorithm to find solutions</span>';
        
        // Generate simulation steps
        generateSimulationSteps();
        
        // Enable step button
        stepButton.disabled = false;
    }

    // Update the original set display
    function updateOriginalSetDisplay() {
        originalSetDisplay.innerHTML = '';
        if (inputSet.length === 0) {
            originalSetDisplay.innerHTML = '<span class="empty-message">Empty set</span>';
            return;
        }
        
        inputSet.forEach(num => {
            const chip = document.createElement('span');
            chip.className = 'number-chip';
            chip.textContent = num;
            originalSetDisplay.appendChild(chip);
        });
    }

    // Generate all simulation steps
    function generateSimulationSteps() {
        simulationSteps = [];
        solutions = []; // Clear solutions array
        
        function backtrack(index, subset, sum, decisions) {
            // Create a state object for visualization
            const state = {
                index,
                subset: [...subset],
                sum,
                decisions: [...decisions],
                status: 'checking'
            };
            
            // Check if we found a solution
            if (sum === targetSum) {
                state.status = 'solution';
                solutions.push([...subset]);
                simulationSteps.push(state);
                return;
            }
            
            // Check if we need to backtrack
            if (sum > targetSum || index >= inputSet.length) {
                state.status = 'rejected';
                simulationSteps.push(state);
                return;
            }
            
            // Add current state to steps
            simulationSteps.push({...state});
            
            // Include current element
            subset.push(inputSet[index]);
            decisions.push({ index, included: true });
            backtrack(index + 1, subset, sum + inputSet[index], decisions);
            
            // Exclude current element
            subset.pop();
            decisions.pop();
            decisions.push({ index, included: false });
            backtrack(index + 1, subset, sum, decisions);
            
            // Remove the decision for backtracking
            decisions.pop();
        }
        
        backtrack(0, [], 0, []);
    }

    // Execute the algorithm and show all solutions
    function solveAll() {
        initialize();
        stepMode = false;
        
        // Display all solutions
        displayAllSolutions();
    }

    // Display all found solutions
    function displayAllSolutions() {
        solutionsElement.innerHTML = '';
        
        if (solutions.length === 0) {
            solutionsElement.innerHTML = '<span class="empty-message">No solutions found</span>';
            return;
        }
        
        solutions.forEach((solution, index) => {
            const solutionCard = document.createElement('div');
            solutionCard.className = 'solution-card';
            
            const solutionSubset = document.createElement('div');
            solutionSubset.className = 'solution-subset';
            solutionSubset.textContent = `Solution ${index + 1}: [${solution.join(', ')}]`;
            
            const solutionSum = document.createElement('div');
            solutionSum.className = 'solution-sum';
            solutionSum.textContent = `Sum: ${targetSum}`;
            
            solutionCard.appendChild(solutionSubset);
            solutionCard.appendChild(solutionSum);
            
            solutionsElement.appendChild(solutionCard);
        });
    }

    // Start step-by-step simulation
    function startStepSimulation() {
        initialize();
        stepMode = true;
        currentStepIndex = 0;
        
        // Clear previous displays
        executionLogElement.innerHTML = '';
        decisionTreeElement.innerHTML = '';
        solutionsElement.innerHTML = '';
        
        // Show first step
        showNextStep();
    }

    // Show the next step in the simulation
    function showNextStep() {
        if (currentStepIndex >= simulationSteps.length) {
            stepButton.disabled = true;
            if (solutions.length === 0) {
                solutionsElement.innerHTML = '<span class="empty-message">No solutions found</span>';
            }
            return;
        }
        
        const step = simulationSteps[currentStepIndex];
        
        // Update current subset display
        updateCurrentSubsetDisplay(step);
        
        // Update current sum
        currentSumDisplay.textContent = step.sum;
        
        // Add to execution log
        addExecutionLogEntry(step);
        
        // Add to decision tree
        addDecisionTreeNode(step);
        
        // If this is a solution, add to solutions display
        if (step.status === 'solution') {
            addSolutionCard(step.subset);
        }
        
        currentStepIndex++;
    }

    // Update the current subset display
    function updateCurrentSubsetDisplay(step) {
        currentSubsetDisplay.innerHTML = '';
        
        if (step.subset.length === 0) {
            currentSubsetDisplay.innerHTML = '<span class="empty-message">Empty</span>';
            return;
        }
        
        step.subset.forEach(num => {
            const chip = document.createElement('span');
            chip.className = 'number-chip included';
            chip.textContent = num;
            currentSubsetDisplay.appendChild(chip);
        });
    }

    // Add an entry to the execution log
    function addExecutionLogEntry(step) {
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${step.status}`;
        
        let logContent = '';
        
        if (step.index < inputSet.length) {
            const currentElement = inputSet[step.index];
            
            if (step.decisions.length > 0 && step.decisions[step.decisions.length - 1].included) {
                logContent += `<p>Including element ${currentElement} at index ${step.index}</p>`;
            } else if (step.decisions.length > 0) {
                logContent += `<p>Excluding element ${currentElement} at index ${step.index}</p>`;
            } else {
                logContent += `<p>Starting with element ${currentElement} at index ${step.index}</p>`;
            }
        }
        
        logContent += `<p>Current subset: [${step.subset.join(', ')}]</p>`;
        logContent += `<p>Current sum: ${step.sum}</p>`;
        
        if (step.status === 'solution') {
            logContent += `<p><strong>Solution found!</strong> Subset sums to target ${targetSum}</p>`;
        } else if (step.status === 'rejected') {
            if (step.sum > targetSum) {
                logContent += `<p>Backtracking: Sum ${step.sum} exceeds target ${targetSum}</p>`;
            } else if (step.index >= inputSet.length) {
                logContent += `<p>Backtracking: Reached end of set, sum ${step.sum} ≠ target ${targetSum}</p>`;
            }
        }
        
        logEntry.innerHTML = logContent;
        executionLogElement.appendChild(logEntry);
        executionLogElement.scrollTop = executionLogElement.scrollHeight;
    }

    // Add a node to the decision tree visualization
    function addDecisionTreeNode(step) {
        const treeNode = document.createElement('div');
        treeNode.className = `tree-node ${step.status}`;
        
        const nodeContent = document.createElement('div');
        nodeContent.className = 'node-content';
        
        const nodeSubset = document.createElement('span');
        nodeSubset.className = 'node-subset';
        nodeSubset.textContent = `[${step.subset.join(', ')}]`;
        
        const nodeSum = document.createElement('span');
        nodeSum.className = 'node-sum';
        nodeSum.textContent = `Sum: ${step.sum}`;
        
        const nodeStatus = document.createElement('span');
        nodeStatus.className = `node-status ${step.status}`;
        
        if (step.status === 'solution') {
            nodeStatus.textContent = 'Solution';
        } else if (step.status === 'rejected') {
            nodeStatus.textContent = 'Rejected';
        } else {
            nodeStatus.textContent = 'Checking';
        }
        
        nodeContent.appendChild(nodeSubset);
        nodeContent.appendChild(nodeSum);
        nodeContent.appendChild(nodeStatus);
        
        treeNode.appendChild(nodeContent);
        
        if (step.decisions.length > 0) {
            const lastDecision = step.decisions[step.decisions.length - 1];
            const decisionInfo = document.createElement('div');
            decisionInfo.className = 'decision-info';
            
            if (lastDecision.included) {
                decisionInfo.textContent = `Included ${inputSet[lastDecision.index]}`;
            } else {
                decisionInfo.textContent = `Excluded ${inputSet[lastDecision.index]}`;
            }
            
            treeNode.appendChild(decisionInfo);
        }
        
        decisionTreeElement.appendChild(treeNode);
        decisionTreeElement.scrollTop = decisionTreeElement.scrollHeight;
    }

    // Add a solution card to the solutions display
    function addSolutionCard(subset) {
        // Clear "no solutions" message if it exists
        if (solutionsElement.innerHTML.includes('No solutions found') || 
            solutionsElement.innerHTML.includes('Run the algorithm')) {
            solutionsElement.innerHTML = '';
        }
        
        const solutionCard = document.createElement('div');
        solutionCard.className = 'solution-card';
        
        const solutionSubset = document.createElement('div');
        solutionSubset.className = 'solution-subset';
        solutionSubset.textContent = `[${subset.join(', ')}]`;
        
        const solutionSum = document.createElement('div');
        solutionSum.className = 'solution-sum';
        solutionSum.textContent = `Sum: ${targetSum}`;
        
        solutionCard.appendChild(solutionSubset);
        solutionCard.appendChild(solutionSum);
        
        solutionsElement.appendChild(solutionCard);
    }

    // Reset the simulation
    function resetSimulation() {
        inputSetElement.value = '3, 5, 6, 7, 8';
        targetSumElement.value = '15';
        initialize();
        stepMode = false;
    }

    // Event listeners
    solveButton.addEventListener('click', solveAll);
    stepButton.addEventListener('click', function() {
        if (!stepMode) {
            startStepSimulation();
        } else {
            showNextStep();
        }
    });
    resetButton.addEventListener('click', resetSimulation);

    // Initialize on load
    initialize();
});
