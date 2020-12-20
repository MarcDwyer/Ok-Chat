Problem: Similar to vscode, this application will save your session. In this apps case, it'll
save which tabs are open (which twitch channels you've opted to join) so if you were to exit the app it'll restore your previous session without having to re-join all your channels. This must be ordered, so an array seems like the best choice to store this data. However, I require easy access to a channel's data and accessing an array with the index is a great way to do this.

Solution: Use a Map

Problem: In order to preserve low memory usage messages should be cleaned up every 24 hours or so.
