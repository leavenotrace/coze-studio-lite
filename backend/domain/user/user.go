package domain

import "time"

type User struct {
    ID           string    `gorm:"primaryKey;size:32" json:"id"`
    Email        string    `gorm:"uniqueIndex;size:255" json:"email"`
    PasswordHash string    `gorm:"size:255" json:"-"`
    CreatedAt    time.Time `json:"created_at"`
}
