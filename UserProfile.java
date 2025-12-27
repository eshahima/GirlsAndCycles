import java.util.HashSet;
import java.util.Random;
import java.util.Set;

// the class userprofile
public class UserProfile {
    // what characterstics does a user profile have?
    private int stress;
    private double sleepHours;
    private double exerciseHours;
    private double cycleLength;
    private String result = "";
    private int[] predictedCyclesArr = new int[3];
    private Set<String> explanationsSet = new HashSet<>();
    private Random random = new Random();

    // enums for cycle phases
    public enum CyclePhase {
        FOLLICULAR,
        OVULATORY,
        LUTEAL,
        MENSTRUAL
    }

    // constructor empty!!!
    // WORK ON THIS
    public UserProfile() {
        // default
    }

    public UserProfile(int stress, double sleepHours, double exerciseHours) {
        if (stress < 0 || stress > 10 || sleepHours < 0.0 || exerciseHours < 0.0) {
            throw new IllegalArgumentException("Invalid inputs");
        }
        this.stress = stress;
        this.sleepHours = sleepHours;
        this.exerciseHours = exerciseHours;
    }

    // have high, low, and medium exercise levels. and should be per week
    public String exerciseClassify() {
        if (exerciseHours > 7) {
            return "high";
        } else if (exerciseHours == 7) {
            return "moderate";
        } else {
            return "low";
        }
    }

    // stress and poor sleep use Gaussian jitter
    // high exercise pushes towards longer cycles
    // ADJUSTMENT ONLY SHOWS RAW NUMERICAL DATA
    // Compute an adjusted cycle length (rounded to int on return).
    // This uses simple heuristics: high stress or poor sleep increases variability.
    public int adjustment(int stress, double sleepHours, double exerciseHours) {
        if (stress < 0 || stress > 10 || sleepHours < 0.0 || exerciseHours < 0.0) {
            throw new IllegalArgumentException();
        }
        this.stress = stress;
        this.sleepHours = sleepHours;
        this.exerciseHours = exerciseHours;

        double base = 28.0;

        if (stress >= 8 || sleepHours < 7.0) {
            // more variability
            cycleLength = base + random.nextGaussian() * 3.0;
        } else if (exerciseHours >= 7 && sleepHours < 7.0) {
            cycleLength = 30.0 + random.nextGaussian() * 2.0;
        } else if (exerciseHours >= 7) {
            // high exercise tends to lengthen the cycle a bit
            cycleLength = base + 1.5 + random.nextGaussian() * 1.5;
        } else {
            cycleLength = base + random.nextGaussian() * 1.0;
        }

        if (cycleLength < 20.0) {
            cycleLength = 20.0;
        }
        if (cycleLength > 40.0) {
            cycleLength = 40.0;
        }

        return (int) Math.round(cycleLength);
    }

    // classifying the cyclelength into a category
    // no explanation
    public String classification(int cycleLength) {
        if (cycleLength >= 21 && cycleLength <= 35) {
            result = "normal";
        } else {
            result = "irregular";
        }

        // if predicted array has been populated, and the last predicted cycle is larger
        if (predictedCyclesArr != null && predictedCyclesArr.length >= 3 && predictedCyclesArr[2] != 0) {
            if (predictedCyclesArr[2] > cycleLength) {
                result = "watch for change!";
            }
        }

        return result;
    }

    // explaining- cause and effect descriptions
    // explanation added to a set!!! so that it doesn't repeatedly show the user this warning
    public String explanation() {
        explanationsSet.clear();
        String reason = "";
        String cls = classification((int) Math.round(cycleLength));

        if ("normal".equals(cls)) {
            explanationsSet.add("Your predicted cycle length is regular. Your sleep and exercise hours are normal and your stress is under control.");
        } else if ("irregular".equals(cls) && cycleLength < 21) {
            if (stress >= 8) {
                reason = " high stress";
            } else if (sleepHours < 7.0) {
                reason = " low sleep";
            }
            explanationsSet.add("Your predicted cycle length is shorter than regular. It's likely because of" + reason);
        } else if ("irregular".equals(cls) && cycleLength > 35) {
            explanationsSet.add("Your predicted cycle length is longer than regular. It's likely because of long hours of exercise or disrupted recovery.");
        } else {
            explanationsSet.add("Your predicted cycle length may change over the course of 3 months.");
        }

        // return a single string summary (also keep the set for programmatic access)
        StringBuilder sb = new StringBuilder();
        for (String s : explanationsSet) {
            if (sb.length() > 0) sb.append(" ");
            sb.append(s);
        }
        return sb.toString();
    }

    // stimulate multiple cycles in one sequence - shows what happens to cycle over 3 months
    // and input the three predicted cycles into the map
    // loops
    // Simulate three months and fill predictedCyclesArr
    public String threeMonthSim(int stress, double sleepHours, double exerciseHours) {
        if (stress < 0 || stress > 10 || sleepHours < 0.0 || exerciseHours < 0.0) {
            throw new IllegalArgumentException();
        }

        // month 0 - baseline
        int first = adjustment(stress, sleepHours, exerciseHours);
        predictedCyclesArr[0] = first;

        for (int i = 1; i < 3; i++) {
            double variation = random.nextGaussian() * 1.5; // +/- ~1.5 days
            int cycle = (int) Math.round(predictedCyclesArr[i - 1] + variation);
            if (cycle < 18) cycle = 18;
            if (cycle > 60) cycle = 60;
            predictedCyclesArr[i] = cycle;
        }

        // compare first to last
        int last = predictedCyclesArr[2];
        if (first == last) {
            return "Your predicted cycle length remains stable over three months, suggesting your stress, sleep, and exercise patterns are consistent.";
        } else if (last > first) {
            return "Your predicted cycle length gradually increases over three months, likely due to sustained exercise load or reduced recovery.";
        } else {
            return "Your predicted cycle length decreases over three months, which may reflect improving sleep or reduced stress.";
        }
    }

    public boolean compare(int monthOne, int monthTwo) {
        if (monthOne < 1 || monthOne > 3 || monthTwo < 1 || monthTwo > 3) {
            throw new IllegalArgumentException("month should be 1-3");
        }
        return predictedCyclesArr[monthOne - 1] == predictedCyclesArr[monthTwo - 1];
    }

    // Getters for use by callers
    public int[] getPredictedCycles() {
        return predictedCyclesArr;
    }

    public double getCycleLength() {
        return cycleLength;
    }
}

