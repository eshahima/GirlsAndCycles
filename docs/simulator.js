(function(window){

//probability function is to stimulate probability... usually these factors create minus or plus days so in order to choose between those
function probability() {
        const variations = [-1, 0, 1, 2];
        let variation = variations[Math.floor(Math.random() * variations.length)];
    return variation;
}

function _validateInputs(stress, sleepHours, exerciseHours) {
    if (!Number.isFinite(stress) || stress < 0 || stress > 10 || !Number.isFinite(sleepHours) || sleepHours < 0 || !Number.isFinite(exerciseHours) || exerciseHours < 0) {
        throw new Error('Invalid inputs');
    }
}

// small helper to escape text before writing as HTML
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

class UserProfile {
    constructor(stress, sleepHours, exerciseHours) {
        _validateInputs(stress, sleepHours, exerciseHours);
        if (stress < 0 || stress > 10 || sleepHours < 0.0 || exerciseHours < 0.0) {
            throw new Error('Invalid inputs');
        }
        this.stress = stress;
        this.sleepHours = sleepHours;
        this.exerciseHours = exerciseHours;
        this.cycleLength = 0;
        this.predictedCyclesArr = [0, 0, 0];
        this.explanations = new Set();
    }

    getPredictedCycles() {
        const first = this.adjustment(this.stress, this.sleepHours, this.exerciseHours);
        this.predictedCyclesArr[0] = first;
        for (let i = 1; i < 3; i++) {
            const variation = probability() * 1.5; // +/- ~1.5 days
            let cycle = Math.round(this.predictedCyclesArr[i - 1] + variation);
            if (cycle < 20) {
                cycle = 20;
            }
            if (cycle > 40) {
                cycle = 40;
            }
            this.predictedCyclesArr[i] = cycle;
        }
        return this.predictedCyclesArr;
    }

    //this helps classify exercise level
    exerciseClassify() {
        if (this.exerciseHours > 7)  return 'high';
        if (this.exerciseHours === 7) return 'moderate';
        return 'low';
    }

    //adjustment function to calculate the cycle length
    adjustment(stress, sleepHours, exerciseHours) {
        if (stress < 0 || stress > 10 || sleepHours < 0.0 || exerciseHours < 0.0) {
            throw new Error('Invalid inputs');
        }
        this.stress = stress;
        this.sleepHours = sleepHours;
        this.exerciseHours = exerciseHours;
        let cycleLength = this.cycleLength;
        const base = 28.0;

        //the formula:
        //adds days to the base
        //* 3.0
        if (stress >= 8 || sleepHours < 7.0) {
            cycleLength = base + probability() * 3.0;
        } else if (exerciseHours >= 7 && sleepHours < 7.0) {
            cycleLength = 30.0 + probability() * 2.0;
        } else if (exerciseHours >= 7) {
            cycleLength = base + 1.5 + probability() * 1.5;
        } else {
            cycleLength = base + probability() * 1.0;
        }

        //bounds 
        if (cycleLength < 20.0) {
            cycleLength = 20.0;
        }
        if (cycleLength > 40.0) {
            cycleLength = 40.0;
        }

        this.cycleLength = Math.round(cycleLength);
        return this.cycleLength;
    }

    classification(cycleLength) {
        if (this.cycleLength >= 21 && this.cycleLength <= 35) {
            this.result = 'normal';
        } else {
            this.result = 'irregular';
        }
        if (this.predictedCyclesArr[2] > this.cycleLength) {
            this.result = 'watch for change!';
        }
        return this.result;
    }

    explanation() {
        this.explanations.clear();
        let reason = '';
        const cls = this.classification(this.cycleLength);
        if (cls == 'normal' && this.sleepHours >= 7 && this.stress <= 8) {
            reason = ' It\'s likely because of your sleep and exercise hours are normal and your stress is under control.';
        } else if (cls == 'irregular' && this.cycleLength > 35 && (this.exerciseHours >= 7)) {
            reason = " It\'s likely because of long hours of exercise or disrupted recovery.";
        }
        if (cls == 'normal') {
            this.explanations.add('Your predicted cycle length is regular.' + reason);
        } else if (cls == 'irregular' && this.cycleLength < 21) {
            if (this.stress >= 8) {
                reason = ' high stress';
            } else if (this.sleepHours < 7.0) {
                reason = ' low sleep';
            }
            this.explanations.add('Your predicted cycle length is shorter than regular. It\'s likely because of' + reason);
        } else if (cls == 'irregular' && this.cycleLength > 35) {
            this.explanations.add('Your predicted cycle length is longer than regular.' + reason);
        } else {
            this.explanations.add('Your predicted cycle length may change over the course of 3 months.');
        }
        return Array.from(this.explanations).join(' ');
    }

    compare(monthOne, monthTwo) {
        if (!Number.isInteger(monthOne) || !Number.isInteger(monthTwo) || monthOne < 1 || monthOne > 3 || monthTwo < 1 || monthTwo > 3) {
            throw new Error('month should be 1 - 3');
        }
        return this.predictedCyclesArr[monthOne - 1] == this.predictedCyclesArr[monthTwo - 1];
    }

    threeMonthSim(stress, sleepHours, exerciseHours) {
        if (this.stress < 0 || this.stress > 10 || this.sleepHours < 0.0 || this.exerciseHours < 0.0) {
            throw new Error('Invalid inputs');
        }
        if (this.compare(1, 3)) {
            return 'Your predicted cycle length remains stable over three months, suggesting your stress, sleep, and exercise patterns are consistent.';
        } else if (this.predictedCyclesArr[2] > this.predictedCyclesArr[0]) {
            return 'Your predicted cycle length gradually increases over three months, likely due to sustained exercise load or reduced recovery.';
        } else {
            return 'Your predicted cycle length decreases over three months, which may reflect improving sleep or reduced stress.';
        }
    }





    getCycleLength() {
        return this.cycleLength;
    }

}

class Athlete extends UserProfile {
    constructor(stress, sleepHours, exerciseHours) {
        super(stress, sleepHours, exerciseHours);
    }

    adjustment(stress, sleepHours, exerciseHours) {
        if (this.stress < 0 || this.stress > 10 || this.sleepHours < 0.0 || this.exerciseHours < 0.0) {
            throw new Error('Invalid input!');
        }

        const base = super.adjustment(stress, sleepHours, exerciseHours);

        let adjustment = 0.0;
        if (sleepHours < 7.0) {
            adjustment += 2.0; // poor sleep delays ovulation
        }

        if (stress >= 8) {
            adjustment += 1.5;
        }

        if (exerciseHours >= 8) {
            adjustment += 2.5; // strong push toward longer cycles
        } else if (exerciseHours >= 4) {
            adjustment += 1.0;
        }

        let finalCycle = base + adjustment + probability() * 1.0;
        if (finalCycle < 20) {
            finalCycle = 20;
        }
        if (finalCycle > 40) {
            finalCycle = 40;
        }

        return Math.round(finalCycle);
    }

    explanation() {
        let parent = super.explanation();
        if (this.getCycleLength() > 35) {
            parent += ' As an athlete, high training load and low recovery lengthen cycles; consider reviewing recovery and sleep.';
        }
        return parent;
    }
}

    window.UserProfile = UserProfile;
    window.Athlete = Athlete;

//this wires simulator html/css/js to simulation code in js
document.addEventListener('DOMContentLoaded', () => { //when the HTML doc is loaded
    //this is the form; stores html element and store it in form js
    const form = document.getElementById('simulator-form');
    //this is the output/explanation/results produced
    const output = document.getElementById('simulator-result');
    //when form or output doesn't exist just exit
    if (!form || !output) return;

    //an event listener to when the form is submitted
    form.addEventListener('submit', (ev) => {
        
        ev.preventDefault();
        try {
            //input inside form with that var name and it becomes the numeric type thru Number()
            // the || __ part shows that the value becomes ___
                const stress = Number(form.querySelector('[name="stress"]').value || 0);
                const sleepHours = Number(form.querySelector('[name="sleepHours"]').value || 8);
                const exerciseHours = Number(form.querySelector('[name="exerciseHours"]').value || 0);
                const profileType = (form.querySelector('[name="profileType"]') || {}).value || 'user';
                
                //athlete profile is created if profile type is athlete 
                const profile = (profileType === 'athlete') ? new Athlete(stress, sleepHours, exerciseHours) : new UserProfile(stress, sleepHours, exerciseHours);
                const cycles = profile.getPredictedCycles();
                const classification = profile.classification(profile.getCycleLength());
                const explanation = profile.explanation();
                const threeMonthMessage = profile.threeMonthSim(stress, sleepHours, exerciseHours);
                
                //writes results into output element as HTML
                output.innerHTML =
                    `<p>${escapeHtml(threeMonthMessage)}</p>` +
                    `<p><strong>Predicted cycles (days):</strong> ${escapeHtml(cycles.join(', '))}</p>` +
                    `<p><strong>Classification:</strong> ${escapeHtml(classification)}</p>` +
                    `<h2 class="simulator-notes">${escapeHtml(explanation)}</h2>`;
            //if any error occurs show error message
            } catch (err) {
                output.textContent = err.message || String(err);
            }
        });
});
})(window);





