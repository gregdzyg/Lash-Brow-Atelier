package pl.atelierbypt.backend.enums;

public enum ImageStorageFolder {
    GALLERY("gallery/"),
    NEWS("news/");

    private final String objectKeyPrefix;

    ImageStorageFolder(String objectKeyPrefix) {
        this.objectKeyPrefix = objectKeyPrefix;
    }

    public String objectKeyPrefix() {
        return objectKeyPrefix;
    }
}
