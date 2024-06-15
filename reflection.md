## Final Reflection

# What advice would I give to myself if I were to start a project like this again?
- Don't use eval(), there are various alternatives that work better, are easier to tell from not having code within strings, and have less security vulnerabilities.
- Don't try to put your own spin on it until after you are confident that you can get the base part done.
- Leave comments where possible that you can later expand on and split everything into smaller functions. Don't just say "ah I'll fix it later" because then you forget what things do and basically have to like decode the logic in your head.
- Even if the game would really really benefit from extra polish, focus on at least technically getting everything in your "needs to have" or at least knowing how to implement it.
- Think ahead; don't code something you intend to replace later without describing what each part does.

# Did I complete everything in my "Needs to Have" list?
- I finished everything except for one: adding audio. I ended up running out of time from trying to finish the options menu, despite technically already having enough to qualify for that "need to have".
- I did manage to get the ghost piece from my "nice to have" list.

# What was the hardest part of the project?
- I would consider two things to be the hardest: adding the logic for kick-tests, and cleaning up my messy code.
- The kick-test logic, done during project 2, was a lot harder than I expected, which resulted in me not finishing the tetris game then. There were so many conditions to go to each outcome, and with how I coded, it was a big, ugly, if chain that just was long and unreadable. But somehow worked.
- Since I didn't leave barely any comments during project 2, there was a lot of code that I ended up having to decipher that were in giant chunks. Around half of the time spent during final project work time was cleaning up and commenting this code, and I am still not happy with some parts.

# Were there any problems I could not solve?
- As a result of spaghetti code from project 2, I could not figure out how to implement having the active tetromino move down more than one mino per frame without breaking soft dropping.
- I didn't finish solving the scaling for the UI when changing the amount of pieces in the next piece queue or changing the columns/rows.
- I also didn't finish the settings menu, although that is more of running out of time than being stumped on it.