public class Runner {
    public static void main(String[] args) {
        if (args.length == 0) {
            System.out.println("Usage: java Runner <questionNumber>");
            System.out.println("Example: java Runner 1");
            return;
        }
        int num = Integer.parseInt(args[0]);
        switch (num) {
            case 1 -> Question1.run();
            default -> System.out.println("Question " + num + " not found");
        }
    }
}