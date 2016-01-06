package servlets

import javax.servlet.http._
/*
import org.slf4j.LoggerFactory
import ch.qos.logback.core.util.StatusPrinter
import ch.qos.logback.classic.LoggerContext
*/

class HelloServlet extends HttpServlet {

  override def doGet(request: HttpServletRequest, response: HttpServletResponse) {
    response.setContentType("text/html")
    response.setCharacterEncoding("UTF-8")
    response.getWriter.write("""<h1>Hello, worldcon 75!</h1>""")
  }

}

class StripeServlet extends HttpServlet {

  /*
  def logger = LoggerFactory.getLogger(this.getClass) 
  logger.info("Pietu's log test STDOUT")
  logger.debug("Pietu's log test FILE")
  */

  // read secret key from filesystem
  val secret_key = getSecretKey()
  println("Secret Key: " + secret_key)

  // override def doGet(request: HttpServletRequest, response: HttpServletResponse) {
  override def doPost(request: HttpServletRequest, response: HttpServletResponse) {

    response.setContentType("text/html")
    response.setCharacterEncoding("UTF-8")
    response.setHeader("Access-Control-Allow-Origin", "*");       // Need to add the correct domain in here!!
    //response.setHeader("Access-Control-Allow-Methods", "POST");   // Only allow POST, moot with "doPost"
    response.setHeader("Access-Control-Max-Age", "300");          // Cache response for 5 minutes
    response.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept"); // Ensure this header is also allowed!  

    val reqMethod = "Request Method: " + request.getMethod()
    // response.getWriter.write(reqMethod)
    println(reqMethod)

    var params = request.getParameterNames() 
    while(params.hasMoreElements()){
      val paramName = params.nextElement()
      val myOutput = "POST VAR: " + paramName + " = " + request.getParameter(paramName)
      // response.getWriter.write(myOutput)
      println(myOutput)
    }
  }

  def getSecretKey() : String = {
    import scala.io.Source
    import java.io.InputStream

    val file = getClass.getResource("/secret-key.txt")
    if (file != null) {
      println("Found File !!!")
    } else {
      println("NO file found. WTF!!!")
    }
    /*
    // val myString = Source.fromInputStream(getClass.getResourceAsStream("/secret-key.txt")).mkString
    val stream : InputStream = getClass.getResourceAsStream("/secret-key.txt")
    val lines = scala.io.Source.fromInputStream( stream ).getLines
    for(line <- lines) {
      println(line)
    }

    myString = scala.io.Source.fromInputStream(stream).mkString
    */
    val myString = "some output, since the function expects output"
    return myString
  }

  /*
  def charge() = {
    // Set your secret key: remember to change this to your live secret key in production
    // See your keys here https://dashboard.stripe.com/account/apikeys
    Stripe.apiKey = getSecretKey()

    // Get the credit card details submitted by the form
    String token = request.getParameter("stripeToken");

    // Create the charge on Stripe's servers - this will charge the user's card
    try {
      Map<String, Object> chargeParams = new HashMap<String, Object>();
      chargeParams.put("amount", 1000); // amount in cents, again
      chargeParams.put("currency", "usd");
      chargeParams.put("source", token);
      chargeParams.put("description", "Example charge");

      Charge charge = Charge.create(chargeParams);
    } catch (CardException e) {
      // The card has been declined
    }

  }
  */
}