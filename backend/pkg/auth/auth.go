package auth

import (
    "time"

    "github.com/golang-jwt/jwt/v5"
)

var jwtKey = []byte("dev-secret-key-change-this")

func GenerateToken(userID string) (string, error) {
    claims := jwt.MapClaims{
        "sub": userID,
        "exp": time.Now().Add(24 * time.Hour).Unix(),
    }
    t := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return t.SignedString(jwtKey)
}

func ParseToken(tok string) (string, error) {
    t, err := jwt.Parse(tok, func(token *jwt.Token) (any, error) { return jwtKey, nil })
    if err != nil { return "", err }
    if !t.Valid { return "", err }
    if m, ok := t.Claims.(jwt.MapClaims); ok {
        if sub, ok := m["sub"].(string); ok { return sub, nil }
    }
    return "", nil
}
