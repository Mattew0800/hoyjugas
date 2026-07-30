package hoyjugas.Enum;

public enum SpaceType {

    FUTBOL_5("Fútbol 5"),
    FUTBOL_7("Fútbol 7"),
    FUTSAL("Futsal"),
    TENIS("Tenis"),
    PADEL("Pádel"),
    BASKETBALL("Basketball"),
    VOLLEYBALL("Volleyball"),
    QUINCHO("Quincho");

    private final String displayName;

    SpaceType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}