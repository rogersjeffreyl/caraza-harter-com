import random

# this returns the text of the book.
# just use it!
# (you don't need to understand how it works at this point in the semester)
def read_book():
    with open('pg420.txt') as f:
        return f.read()

def main():
    text1 = "AAAAABBCCC"
    text2 = ('A good glass in the bishop\'s hostel in the devil\'s seat ' +
             'twenty-one degrees and thirteen minutes northeast and by north ' +
             'main branch seventh limb east side ' +
             'shoot from the left eye of the death\'s-head ' +
             'a bee line from the tree through the shot fifty feet out.')
    text3 = read_book()
    tab = get_table(text1)

    print("After A:")
    print_table(tab['A'])

    print("After B:")
    print_table(tab['B'])

def print_table(t):
    for key in t:
        print(key + ": " + str(t[key] * 100) + '%')

def rand_character(t):
    x = random.random()
    end = 0
    keys = list(t.keys())
    winner = None
    for key in keys:
        end += t[key]
        if end >= x:
            winner = key
            break
    return winner

# return a dictionary
# key: a letter
# value: what is the frequency of that letter in text
def get_table(text):
    # key: a letter
    # val: dictionary (key: the next letter, val: how often)
    counts = {}
    for i in range(len(text) - 1):
        letter1 = text[i]
        letter2 = text[i + 1]
        # counts[letter1] ===> the dictionary for what comes after letter1
        if not letter1 in counts:
            counts[letter1] = {}
        if not letter2 in counts[letter1]:
            counts[letter1][letter2] = 0
        counts[letter1][letter2] += 1

    probs = {}
    for letter1 in counts:
        probs[letter1] = {}
        letter1_count = sum(counts[letter1].values())
        for letter2 in counts[letter1]:
            probs[letter1][letter2] = counts[letter1][letter2] / letter1_count
    return probs

main()
