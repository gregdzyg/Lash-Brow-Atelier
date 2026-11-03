package pl.atelierbypt.backend.enums;

public enum ImageStorageFolder {
    ABOUT("about/"),
    GALLERY("gallery/"),
    NEWS("news/"),
    REVIEWS("reviews/");

    private final String objectKeyPrefix;

    ImageStorageFolder(String objectKeyPrefix) {
        this.objectKeyPrefix = objectKeyPrefix;
    }

    public String objectKeyPrefix() {
        return objectKeyPrefix;
    }
}
