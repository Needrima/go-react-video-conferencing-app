package main

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

var (
	rooms = map[string]bool{}
)

func generateAndRegisterID() string {
	uuid := strings.Replace(uuid.New().String(), "-", "", -1)

	var id string

	rand.Seed(time.Now().UnixNano())
	for i := 0; i<6; i++ {
		index := rand.Intn(len(uuid));
		id += string(uuid[index])
	}

	rooms[id] = true

	return id
}

func CORSMiddleware(f http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")

		f.ServeHTTP(w,r)
	})
}

func main() {
	router := mux.NewRouter()
	router.Use(CORSMiddleware)

	router.HandleFunc("/create_room", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			id := generateAndRegisterID()
			w.Header().Set("content-type", "application/json")
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(map[string]string{
				"id": id,
			})
		default:
			w.Header().Set("content-type", "text/plain")
			w.WriteHeader(http.StatusMethodNotAllowed)
			w.Write([]byte(http.StatusText(http.StatusMethodNotAllowed)))
		}
	})

	router.HandleFunc("/validate_room_id/{id}", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			id := mux.Vars(r)["id"]

			if !regexp.MustCompile(`^[a-zA-z0-9]{6}$`).MatchString(id) {
				w.Header().Set("content-type", "text/plain")
				w.WriteHeader(http.StatusBadRequest)
				w.Write([]byte(http.StatusText(http.StatusBadRequest)))
				return
			}

			if _, ok := rooms[id]; !ok {
				w.Header().Set("content-type", "text/plain")
				w.WriteHeader(http.StatusUnauthorized)
				w.Write([]byte(http.StatusText(http.StatusUnauthorized)))
				return
			}

			w.Header().Set("content-type", "application/json")
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(map[string]bool{
				"valid": true,
			})
		default:
			w.Header().Set("content-type", "text-plain")
			w.WriteHeader(http.StatusMethodNotAllowed)
			w.Write([]byte(http.StatusText(http.StatusMethodNotAllowed)))
		}

	})

	fmt.Println("serving on port 8080")
	http.ListenAndServe(":8080", router)
}