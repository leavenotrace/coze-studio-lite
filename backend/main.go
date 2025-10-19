package main

import (
	"log"

	"github.com/coze-dev/coze-studio/backend/api"
)

func main() {
	if err := api.Run(); err != nil {
		log.Fatal(err)
	}
}