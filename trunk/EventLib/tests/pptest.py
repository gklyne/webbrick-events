from pyparsing import Literal, Empty, replaceWith

def insertResult(v):
    """
    Parser helper function that simply inserts a result in 
    the list of values returned.
    """
    return Empty().setParseAction( replaceWith(v) )

p1 = Literal("1")
p2 = Literal("2")+insertResult("B")     # 'AttributeError: 'NoneType' object has no attribute 'streamline''
p3 = insertResult("B")+Literal("3")   # Blows python stack

r1 = p1.parseString("1")
r2 = p2.parseString("2")
r3 = p3.parseString("3")

print r2

print r3
