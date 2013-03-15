// Original version by Antonio Galea
// Updated by Marcello Gesmundo introducing a debouncer
// Reference: https://github.com/ant9000/FoxNode/blob/master/acme/gpio/poll.c

#include <stdio.h>
#include <stdlib.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>
#include <errno.h>
#include <string.h>
#include <poll.h>
#include <sys/time.h>
#include <math.h>
#include <signal.h>

void alarmHandler(int sig) {
    // ignore the alarm
    signal(sig, SIG_IGN);
}

int main(int argc, char *argv[]){    
    struct pollfd *descriptors;
    int i, n, fd, err;
    int tc = 0;
    int debounce = 0;
    int start = 0;
    long int elapsed = 0;
    struct timeval tvBegin, tvEnd, tvDiff;
    char buf[2] = {0,0};
    char last[2] = {0,0};    
    
    if(argc == 1) {
        printf("Usage: %s file [debounce (ms)]\n", argv[0]);
        exit(1);
    }
    if (argc == 3) {
        debounce = atoi(argv[2]);
        if (debounce >= 1000) {
            printf("Debounce must be < 1000 ms\n");
            exit(1);
        }
        // debounce in useconds
        debounce = debounce * 1000;
    }
    descriptors = calloc(1, sizeof(struct pollfd));
    if((fd = open(argv[1], O_RDONLY)) == -1) {
        err = errno;
        fprintf(stderr, strerror(err));
        exit(1);
    }
    descriptors[0].fd = fd;
    descriptors[0].events = POLLPRI;
    
    // start main loop
    while(1) {
        if(poll(descriptors, 1, -1) == -1) {
            err = errno;
            fprintf(stderr, strerror(err));
            exit(1);
        }
        if(descriptors[0].revents & POLLPRI) {
            fd = descriptors[0].fd;
            if(lseek(fd, 0, SEEK_SET) == -1) {
                err = errno;
                fprintf(stderr, strerror(err));
                exit(1);
            }
            if(read(fd, buf, 1) == -1) {
                err = errno;
                fprintf(stderr, strerror(err));
                exit(1);
            }
            if (last[0] == 0) {
                last[0] = buf[0];
            }
            if (buf[0] != last[0]) {
                // manage timer only if a debounce is required
                if (debounce >0) {
                    // install timeout handler
                    signal(SIGALRM, alarmHandler);
                    // start timeout timer
                    ualarm((useconds_t)debounce, 0);                
                    if (start == 0) {
                        // begin
                        start = 1;
                        gettimeofday(&tvBegin, NULL);
                        // notify the change
                        printf("%s:%s\n", argv[1], buf);
                        // ignore the alarm if the input does not change until the timer is timed out
                        signal(SIGALRM, SIG_IGN);
                    } else {
                        // end
                        gettimeofday(&tvEnd, NULL);
                        // elapsed time in useconds
                        elapsed = ((tvEnd.tv_usec + 1000000 * tvEnd.tv_sec) - (tvBegin.tv_usec + 1000000 * tvBegin.tv_sec));
                        if (elapsed > debounce) {
                            // notify change only if the elapsed time is greater than the debounce value
                            printf("%s:%s\n", argv[1], buf);
                        }
                        fflush(stdout);
                        pause();
                        start = 0;
                    }
                    last[0] = buf[0];
                } else {
                    printf("%s:%s\n", argv[1], buf);
                    last[0] = buf[0];
                }
            }
            fflush(stdout);
        }
    }
    return 0;
}
