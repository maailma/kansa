package servlets

import javax.servlet.http._
import org.slf4j.LoggerFactory
import ch.qos.logback.core.util.StatusPrinter
import ch.qos.logback.classic.LoggerContext

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

  // override def doGet(request: HttpServletRequest, response: HttpServletResponse) {
  override def doPost(request: HttpServletRequest, response: HttpServletResponse) {

    response.setContentType("text/html")
    response.setCharacterEncoding("UTF-8")
    response.setHeader("Access-Control-Allow-Origin", "*");       // Need to add the correct domain in here!!
    //response.setHeader("Access-Control-Allow-Methods", "POST");   // Only allow POST, moot with "doPost"
    response.setHeader("Access-Control-Max-Age", "300");          // Cache response for 5 minutes
    response.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept"); // Ensure this header is also allowed!  

    // response.getWriter.write("<h2>There will be stripe stuff here!</h2>")
    // response.getWriter.write("Request Method: <strong>" + request.getMethod() + "</strong><br>")
    println("Request Method: " + request.getMethod())

    var params = request.getParameterNames() 
    while(params.hasMoreElements()){
      val paramName = params.nextElement()
      // val myOutput = "Attribute Name: <strong>"+paramName+"</strong>, Value: <strong>"+request.getParameter(paramName)+"</strong><br>"
      // response.getWriter.write(myOutput)
      println("POST VAR: " + paramName + " = " + request.getParameter(paramName))
    }
  }

}