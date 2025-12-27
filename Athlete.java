// athlete profile
// stronger effect on cycle- delayed ovulation
// sleep acts as a buffer
// if poor sleep then delayed ovulation

// athlete profile
// stronger effect on cycle- delayed ovulation
// sleep acts as a buffer
// if poor sleep then delayed ovulation

// Educational explanations emphasize recovery
// "Models higher sensitivity to training load and recovery."
public class Athlete extends UserProfile {

    public Athlete() {
        super();
    }

    public Athlete(int stress, double sleepHours, double exerciseHours) {
        super(stress, sleepHours, exerciseHours);
    }

    @Override
    public int adjustment(int stress, double sleepHours, double exerciseHours) {
        // Athlete model: greater sensitivity to exercise and recovery
        if (stress < 0 || stress > 10 || sleepHours < 0.0 || exerciseHours < 0.0) {
            throw new IllegalArgumentException();
        }

        // start with base behavior from UserProfile but weight exercise more
        // we'll compute a base using parent's logic by calling super.adjustment
        // then nudge it according to athlete-specific rules
        int base = super.adjustment(stress, sleepHours, exerciseHours);

        double adjustment = 0.0;
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

        double finalCycle = base + adjustment + (new java.util.Random()).nextGaussian() * 1.0;
        if (finalCycle < 18) {
            finalCycle = 18;
        }
        if (finalCycle > 60) {
            finalCycle = 60;
        }

        return (int) Math.round(finalCycle);
    }

    // logic should extend not replace
    @Override
    public String explanation() {
        String parent = super.explanation();
        // add athlete-specific note if applicable
        if (getCycleLength() > 35) {
            parent += " As an athlete, high training load and low recovery lengthen cycles; consider reviewing recovery and sleep.";
        }
        return parent;
    }
}
// Educational explanations emphasize recovery
